import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Exercise, Status, WorkoutSet } from '@/types/types'

/**
 * ワークアウトフォームの状態管理フック
 * 
 * トレーニング記録フォームの状態管理とデータ取得を行うカスタムフック。
 * 種目・ステータスのマスタデータ取得、フォーム入力値の管理、
 * 自動値設定（前回重量、セット番号など）、選択種目の履歴取得を提供します。
 * 
 * @returns {Object} フォーム関連の状態とデータ
 */
export const useWorkoutForm = () => {
    // 今日の日付（YYYY-MM-DD形式）
    const today = new Date().toISOString().split('T')[0]

    // === マスタデータ ===
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [statuses, setStatuses] = useState<Status[]>([])

    // === フォーム入力値 ===
    const [exercise, setExercise] = useState('')
    const [status, setStatus] = useState('')
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const [note, setNote] = useState('')
    const [setNumber, setSetNumber] = useState('')
    const [exerciseOrder, setExerciseOrder] = useState('')

    // === 選択種目の履歴表示用 ===
    const [selectedExercise, setSelectedExercise] = useState('')
    const [exerciseHistory, setExerciseHistory] = useState<WorkoutSet[]>([])

    /**
     * マスタデータ（種目とステータス）を取得
     * コンポーネントマウント時に1回だけ実行
     */
    useEffect(() => {
        const fetchMasters = async () => {
            // 種目マスタを取得
            const { data: ex } = await supabase
                .from('exercises')
                .select('exercises_id, name, category')
                .order('exercises_id', { ascending: true })

            // ステータスマスタを取得
            const { data: st } = await supabase
                .from('statuses')
                .select('*')
                .order('statuses_id', { ascending: true })

            setExercises(ex ?? [])
            setStatuses(st ?? [])
        }
        fetchMasters()
    }, [])

    /**
     * 種目順序（exercise_order）を自動設定
     * 今日の記録数に基づいて次の順序番号を設定します
     */
    useEffect(() => {
        const fetchOrder = async () => {
            const { data } = await supabase
                .from('sets')
                .select('id')
                .eq('date', today)

            const count = data?.length ?? 0
            setExerciseOrder(String(count + 1))
        }

        fetchOrder()
    }, [exercise, status, weight, reps, today])

    /**
     * メインセットの自動値設定
     * ステータスが「メイン」の場合、前回の重量とセット番号を自動設定します
     */
    useEffect(() => {
        const fetchAutoValues = async () => {
            // メインセット以外、または種目が未選択の場合はスキップ
            if (status !== 'メイン' || !exercise) return

            // 前回の重量を取得（同じ種目のメインセットから）
            const { data: previousData } = await supabase
                .from('sets')
                .select('date, weight')
                .eq('exercise', exercise)
                .eq('status', 'メイン')
                .order('date', { ascending: false })

            const previous = previousData?.[0]

            // 前回データがあれば重量を自動設定
            if (previous) {
                setWeight(String(previous.weight))
            } else {
                setWeight('')
            }

            // 今日の同じ種目・メインセットの数を取得してセット番号を設定
            const { data: todayData } = await supabase
                .from('sets')
                .select('set_number')
                .eq('date', today)
                .eq('exercise', exercise)
                .eq('status', 'メイン')

            const count = todayData?.length ?? 0
            setSetNumber(String(count + 1))
        }

        fetchAutoValues()
    }, [status, exercise, today])

    /**
     * 選択種目の履歴を取得
     * 種目を選択すると、その種目の全記録を新しい順で取得します
     */
    useEffect(() => {
        const fetchExerciseHistory = async () => {
            if (!selectedExercise) {
                setExerciseHistory([])
                return
            }

            const { data } = await supabase
                .from('sets')
                .select('*')
                .eq('exercise', selectedExercise)
                .order('date', { ascending: false })
                .order('set_number', { ascending: true })

            setExerciseHistory(data ?? [])
        }

        fetchExerciseHistory()
    }, [selectedExercise])

    return {
        // 日付
        today,
        // マスタデータ
        exercises,
        statuses,
        // フォーム入力値
        exercise,
        setExercise,
        status,
        setStatus,
        weight,
        setWeight,
        reps,
        setReps,
        note,
        setNote,
        setNumber,
        setSetNumber,
        exerciseOrder,
        setExerciseOrder,
        // 履歴表示用
        selectedExercise,
        setSelectedExercise,
        exerciseHistory
    }
}
