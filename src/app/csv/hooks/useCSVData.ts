import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkoutSet } from '@/types/types'

/**
 * CSV出力用データ取得フック
 * 
 * トレーニングセットと体重データを取得し、CSV出力用に整形します。
 * 
 * @returns {Object} CSVデータと体重マップ
 */
export const useCSVData = () => {
    const [sets, setSets] = useState<WorkoutSet[]>([])
    const [weightsMap, setWeightsMap] = useState<Record<string, number>>({})

    /**
     * トレーニングセットと体重データを取得
     */
    useEffect(() => {
        const fetchData = async () => {
            // トレーニングセットデータを取得（新しい順）
            const { data: setsData, error: setsError } = await supabase
                .from('sets')
                .select('*')
                .order('date', { ascending: false })
                .order('exercise_order', { ascending: true })

            // 体重データを取得
            const { data: weightsData, error: weightsError } = await supabase
                .from('weights')
                .select('date, weight')

            if (setsError) {
                console.error('sets取得失敗:', setsError.message)
            } else {
                setSets(setsData ?? [])
            }

            if (weightsError) {
                console.error('weights取得失敗:', weightsError.message)
            } else {
                // 体重データを日付キーのマップに変換
                const map: Record<string, number> = {}
                weightsData?.forEach(entry => {
                    const dateKey = new Date(entry.date).toISOString().split('T')[0]
                    map[dateKey] = entry.weight
                })
                setWeightsMap(map)
            }
        }

        fetchData()
    }, [])

    return {
        sets,
        weightsMap
    }
}
