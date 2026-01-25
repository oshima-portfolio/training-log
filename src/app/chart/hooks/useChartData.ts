import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseISO, getISOWeek, format, subMonths } from 'date-fns'
import type { ChartDataPoint, ChartMode, ChartType, PeriodFilter, Exercise } from '@/types/types'

// 型を再エクスポート
export type { ChartDataPoint, ChartMode, ChartType, PeriodFilter }

/**
 * チャートデータ取得・管理フック
 * 
 * 全種目に対応し、複数のグラフタイプ（総負荷量/最大重量/推定1RM/セット数）と
 * 期間フィルターをサポートするカスタムフック。
 * 
 * @returns {Object} チャート関連の状態とデータ
 */
export const useChartData = () => {
    // === マスタデータ ===
    const [exercises, setExercises] = useState<Exercise[]>([])

    // === フィルター状態 ===
    const [exercise, setExercise] = useState('')
    const [mode, setMode] = useState<ChartMode>('daily')
    const [chartType, setChartType] = useState<ChartType>('volume')
    const [period, setPeriod] = useState<PeriodFilter>('all')

    // === チャートデータ ===
    const [chartData, setChartData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * 種目マスタを取得
     */
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const { data, error } = await supabase
                    .from('exercises')
                    .select('exercises_id, name, category')
                    .order('exercises_id', { ascending: true })

                if (error) throw error

                setExercises(data ?? [])

                // 初期値として最初の種目を設定（BIG3の「ベンチプレス」があれば優先）
                if (data && data.length > 0) {
                    const benchPress = data.find(ex => ex.name === 'ベンチプレス')
                    setExercise(benchPress?.name ?? data[0].name)
                }
            } catch (err: unknown) {
                console.error('種目マスタの取得に失敗:', err)
            }
        }

        fetchExercises()
    }, [])

    /**
     * 推定1RM計算（Epley式）
     * 1RM = weight × (1 + reps / 30)
     */
    const calculateEstimated1RM = (weight: number, reps: number): number => {
        if (reps === 1) return weight
        return weight * (1 + reps / 30)
    }

    /**
     * チャートデータを取得・計算
     */
    useEffect(() => {
        const fetchData = async () => {
            if (!exercise) return

            setLoading(true)
            setError(null)
            try {
                // 期間フィルターに基づいた開始日の計算
                let startDate: string | null = null
                const now = new Date()

                switch (period) {
                    case '3months':
                        startDate = format(subMonths(now, 3), 'yyyy-MM-dd')
                        break
                    case '6months':
                        startDate = format(subMonths(now, 6), 'yyyy-MM-dd')
                        break
                    case '1year':
                        startDate = format(subMonths(now, 12), 'yyyy-MM-dd')
                        break
                    case 'all':
                    default:
                        startDate = null
                        break
                }

                // 指定種目のメインセットとレストポーズセットを取得
                let query = supabase
                    .from('sets')
                    .select('date, exercise, weight, reps, status')
                    .eq('exercise', exercise)
                    .in('status', ['メイン', 'レストポーズ'])
                    .order('date', { ascending: true })

                // 期間フィルターを適用
                if (startDate) {
                    query = query.gte('date', startDate)
                }

                const { data, error } = await query

                if (error) throw error
                if (!data) return

                /**
                 * 日付文字列をモードに応じたキーに変換
                 * - daily: YYYY-MM-DD
                 * - weekly: YYYY-W##（ISO週番号）
                 * - monthly: YYYY-MM
                 */
                const getKey = (dateStr: string) => {
                    const date = parseISO(dateStr)
                    if (mode === 'weekly') {
                        const year = date.getFullYear()
                        const week = getISOWeek(date)
                        return `${year}-W${week.toString().padStart(2, '0')}`
                    } else if (mode === 'monthly') {
                        return format(date, 'yyyy-MM')
                    } else {
                        return format(date, 'yyyy-MM-dd')
                    }
                }

                // 日付ごと/週ごと/月ごとにデータをグループ化
                const grouped = new Map<string, { weight: number; reps: number }[]>()

                data.forEach(set => {
                    const key = getKey(set.date)
                    if (!grouped.has(key)) grouped.set(key, [])
                    grouped.get(key)?.push({
                        weight: parseFloat(set.weight),
                        reps: parseInt(set.reps),
                    })
                })

                const result: ChartDataPoint[] = []

                // グラフタイプに応じて値を計算
                grouped.forEach((sets, label) => {
                    let value = 0

                    switch (chartType) {
                        case 'volume':
                            // 総負荷量: 重量 × 回数の合計
                            value = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
                            break

                        case 'maxWeight':
                            // 最大重量: 期間内の最大重量
                            value = Math.max(...sets.map(s => s.weight))
                            break

                        case 'estimatedMax':
                            // 推定1RM: 期間内の最大推定1RM
                            value = Math.max(...sets.map(s => calculateEstimated1RM(s.weight, s.reps)))
                            break

                        case 'setCount':
                            // セット数: 期間内のセット数
                            value = sets.length
                            break
                    }

                    result.push({ label, value })
                })

                setChartData(result)
            } catch (err: unknown) {
                console.error(err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('データの取得に失敗しました')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [exercise, mode, chartType, period])

    return {
        // マスタデータ
        exercises,
        // フィルター状態
        exercise,
        setExercise,
        mode,
        setMode,
        chartType,
        setChartType,
        period,
        setPeriod,
        // チャートデータ
        chartData,
        loading,
        error
    }
}
