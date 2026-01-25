import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WeightRecord, WeightHistoryEntry, MonthlyAverage } from '@/types/types'
import {
    enrichWeightData,
    filterRecentMonth,
    calculateMonthlyAverages
} from '../utils/weightCalculations'

/**
 * 体重データ管理フック
 * 
 * 体重データの取得と計算を行うカスタムフック。
 * 全データ取得、前週比・先月比の計算、月別平均の計算、
 * 前回体重の取得（デフォルト値として使用）を提供します。
 * 
 * @param today - 今日の日付（YYYY-MM-DD形式）
 * @returns {Object} 体重データ関連の状態
 */
export const useWeightData = (today: string) => {
    // 直近1ヶ月の体重履歴（前週比・先月比付き）
    const [history, setHistory] = useState<WeightHistoryEntry[]>([])
    // 月別平均体重
    const [monthlyAverages, setMonthlyAverages] = useState<MonthlyAverage[]>([])
    // 前回の体重（今日以外で最新のもの）
    const [lastWeight, setLastWeight] = useState<number | null>(null)

    /**
     * 体重データを取得して各種計算を実行
     */
    useEffect(() => {
        const fetchWeights = async () => {
            // すべての体重データを新しい順で取得
            const { data, error } = await supabase
                .from('weights')
                .select('date, weight')
                .order('date', { ascending: false })

            if (error) {
                console.error('取得失敗:', error.message)
                return
            }

            if (!data) return

            // 前週比・先月比を計算して付与
            const enriched = enrichWeightData(data)

            // 直近1ヶ月分にフィルタして履歴にセット
            const filtered = filterRecentMonth(enriched)
            setHistory(filtered)

            // 前回体重をセット（今日以外で最新のもの）
            const previous = data.find(e => e.date !== today)
            if (previous) setLastWeight(previous.weight)

            // 月別平均を計算
            const averages = calculateMonthlyAverages(data)
            setMonthlyAverages(averages)
        }

        fetchWeights()
    }, [today])

    return {
        history,
        monthlyAverages,
        lastWeight
    }
}
