import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkoutSet, Exercise } from '@/types/types'

/**
 * 履歴データとフィルタリング状態を管理するフック
 * 
 * トレーニングセットの全履歴、体重データ、マスタデータを取得し、
 * フィルタリング機能を提供します。
 * 
 * @returns {Object} 履歴データとフィルタリング関連の状態・関数
 */
export const useHistoryData = () => {
    // データ状態
    const [sets, setSets] = useState<WorkoutSet[]>([])
    const [filteredSets, setFilteredSets] = useState<WorkoutSet[]>([])
    const [weights, setWeights] = useState<Record<string, number>>({})
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [statuses, setStatuses] = useState<string[]>([])

    // フィルター状態
    const [filterExercise, setFilterExercise] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterStartDate, setFilterStartDate] = useState('')
    const [filterEndDate, setFilterEndDate] = useState('')

    /**
     * 履歴データとマスタデータを取得
     */
    useEffect(() => {
        const fetchData = async () => {
            // トレーニングセットデータを取得（新しい順）
            const { data: setsData } = await supabase
                .from('sets')
                .select('*')
                .order('date', { ascending: false })
                .order('exercise_order', { ascending: true })
                .order('set_number', { ascending: true })

            // 体重データを取得
            const { data: weightsData } = await supabase.from('weights').select('*')

            // 種目マスタを取得
            const { data: exData } = await supabase
                .from('exercises')
                .select('exercises_id, name, category')
                .order('exercises_id', { ascending: true })

            // ステータスマスタを取得
            const { data: stData } = await supabase.from('statuses').select('name')

            // 体重データを日付キーのマップに変換
            const weightMap: Record<string, number> = {}
            weightsData?.forEach(w => {
                const date = new Date(w.date).toISOString().split('T')[0]
                weightMap[date] = w.weight
            })

            setSets(setsData ?? [])
            setFilteredSets(setsData ?? [])
            setWeights(weightMap)
            setExercises(exData ?? [])
            setStatuses(stData?.map(s => s.name) ?? [])
        }

        fetchData()
    }, [])

    /**
     * フィルター条件に基づいてデータを絞り込む
     */
    const handleFilter = () => {
        const filtered = sets.filter(set => {
            const date = new Date(set.date).toISOString().split('T')[0]
            return (
                (!filterExercise || set.exercise === filterExercise) &&
                (!filterStatus || set.status === filterStatus) &&
                (!filterStartDate || date >= filterStartDate) &&
                (!filterEndDate || date <= filterEndDate)
            )
        })
        setFilteredSets(filtered)
    }

    /**
     * 指定されたIDのトレーニングセットを更新する
     * @param id 更新するセットのID
     * @param updates 更新するデータ
     */
    const updateSet = async (id: string, updates: Partial<WorkoutSet>) => {
        const { error } = await supabase
            .from('sets')
            .update(updates)
            .eq('id', id)

        if (error) {
            console.error('Error updating set:', error)
            throw error
        }

        // 状態を更新
        const newSets = sets.map(s => s.id === id ? { ...s, ...updates } : s)
        setSets(newSets)

        // フィルター適用後の状態も更新
        setFilteredSets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    }

    /**
     * 指定されたIDのトレーニングセットを削除する
     * @param id 削除するセットのID
     */
    const deleteSet = async (id: string) => {
        const { error } = await supabase
            .from('sets')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting set:', error)
            throw error
        }

        // 状態を更新
        const newSets = sets.filter(s => s.id !== id)
        setSets(newSets)

        // フィルター適用後の状態も更新
        // 現在のフィルター条件で再フィルタリングするか、単純に削除するか
        // ここでは単純に削除（フィルター条件が変わらないため）
        setFilteredSets(prev => prev.filter(s => s.id !== id))
    }

    return {
        // データ
        filteredSets,
        weights,
        exercises,
        statuses,
        // フィルター状態
        filterExercise,
        setFilterExercise,
        filterStatus,
        setFilterStatus,
        filterStartDate,
        setFilterStartDate,
        filterEndDate,
        setFilterEndDate,
        // 操作
        handleFilter,
        updateSet,
        deleteSet
    }
}
