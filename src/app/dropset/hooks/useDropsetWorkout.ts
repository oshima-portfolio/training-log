'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DropsetRoutine } from '@/types/types'
import { getTodayJST } from '@/utils/date'
import { calculateNextRoutine } from '../utils/dropsetLogic'

export function useDropsetWorkout() {
  const [routines, setRoutines] = useState<DropsetRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutines = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('dropset_routines')
      .select('*')
      .order('routine_name', { ascending: true })
      .order('sequence_number', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setRoutines(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRoutines()
  }, [])

  const saveSet = async (routine: DropsetRoutine, reps: number) => {
    const today = getTodayJST()
    
    // 1. 重量更新ロジックの適用
    const { updatedRoutine, message } = calculateNextRoutine(routine, reps)

    // 2. set_number と exercise_order の計算 (workout配下のロジック準拠)
    
    // 同じ日の同じ種目の記録を確認
    const { data: sameExerciseSets } = await supabase
      .from('sets')
      .select('set_number, exercise_order')
      .eq('date', today)
      .eq('exercise', routine.exercise)
      .order('set_number', { ascending: false })

    let nextSetNumber = 1
    if (sameExerciseSets && sameExerciseSets.length > 0) {
      // 同じ種目がある場合、その種目のセット番号をインクリメント
      nextSetNumber = (sameExerciseSets[0].set_number || 0) + 1
    }

    // その日の全セット数を確認して、通算の順序（exercise_order）を決定
    const { data: allSetsToday } = await supabase
      .from('sets')
      .select('id')
      .eq('date', today)
    
    const finalExerciseOrder = (allSetsToday?.length ?? 0) + 1

    // 3. sets テーブルへの保存
    const { error: setError } = await supabase.from('sets').insert([
      {
        date: today,
        exercise: routine.exercise,
        weight: routine.weight, 
        reps: reps,
        status: 'メイン', // メインで固定
        exercise_order: finalExerciseOrder,
        set_number: nextSetNumber,
        note: ''
      }
    ])

    if (setError) {
      return { success: false, error: setError.message }
    }

    // 4. dropset_routines テーブルの更新
    const { error: routineError } = await supabase
      .from('dropset_routines')
      .update({
        weight: updatedRoutine.weight,
        consecutive_success: updatedRoutine.consecutive_success,
        consecutive_failure: updatedRoutine.consecutive_failure,
        is_completed: today
      })
      .eq('id', routine.id)

    if (routineError) {
      return { success: false, error: routineError.message }
    }

    // ローカルの状態を更新
    const updatedWithCompletion = { ...updatedRoutine, is_completed: today }
    setRoutines(prev => prev.map(r => r.id === routine.id ? updatedWithCompletion : r))

    return { success: true, message }
  }

  return { routines, loading, error, saveSet, refresh: fetchRoutines }
}
