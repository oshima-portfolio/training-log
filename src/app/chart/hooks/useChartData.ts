import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseISO, getISOWeek, format, subMonths } from 'date-fns'
import type { ChartDataPoint, ChartMode, ChartType, PeriodFilter, Exercise } from '@/types/types'

// 型を再エクスポート
export type { ChartDataPoint, ChartMode, ChartType, PeriodFilter }

export type TargetType = 'exercise' | 'bodyPart'

/**
 * チャートデータ取得・管理フック
 * 
 * 全種目に対応し、複数のグラフタイプ（総負荷量/最大重量/推定1RM/セット数）と
 * 期間フィルターをサポートするカスタムフック。
 * 種目別・部位別の集計に対応。
 * 
 * @returns {Object} チャート関連の状態とデータ
 */
export const useChartData = () => {
    // === マスタデータ ===
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [categories, setCategories] = useState<string[]>([])

    // === フィルター状態 ===
    const [targetType, setTargetType] = useState<TargetType>('exercise')
    const [exercise, setExercise] = useState('')
    const [bodyPart, setBodyPart] = useState('')
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

                // 部位リストを作成（重複排除）
                if (data) {
                    const uniqueCategories = Array.from(new Set(data.map(ex => ex.category))).sort()
                    setCategories(uniqueCategories)

                    // 初期値設定
                    if (data.length > 0) {
                        const benchPress = data.find(ex => ex.name === 'ベンチプレス')
                        setExercise(benchPress?.name ?? data[0].name)
                        setBodyPart(benchPress?.category ?? uniqueCategories[0] ?? '')
                    }
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
            if (targetType === 'exercise' && !exercise) return
            if (targetType === 'bodyPart' && !bodyPart) return

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

                // クエリ構築
                let query = supabase
                    .from('sets')
                    .select('date, exercise, weight, reps, status')
                    .order('date', { ascending: true })

                // 対象種目の絞り込み
                if (targetType === 'exercise') {
                    query = query.eq('exercise', exercise)
                } else {
                    // 部位別の場合、その部位に属する全種目を対象にする
                    const targetExercises = exercises
                        .filter(ex => ex.category === bodyPart)
                        .map(ex => ex.name)

                    if (targetExercises.length === 0) {
                        setChartData([])
                        setLoading(false)
                        return
                    }

                    query = query.in('exercise', targetExercises)
                }

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
    }, [exercise, bodyPart, targetType, mode, chartType, period, exercises])

    return {
        // マスタデータ
        exercises,
        categories,
        // フィルター状態
        targetType,
        setTargetType,
        exercise,
        setExercise,
        bodyPart,
        setBodyPart,
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
