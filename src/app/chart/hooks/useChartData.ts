import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseISO, getISOWeek, format } from 'date-fns'
import type { VolumePoint, ChartMode } from '@/types/types'

// 共通型定義ファイルから型をインポートして再エクスポート
export type { VolumePoint, ChartMode }

/**
 * チャートデータ取得・管理フック
 * 
 * 指定した種目とモード（日別/週別/月別）に基づいて、
 * 総負荷量データを取得・計算するカスタムフック。
 * 
 * @returns {Object} チャート関連の状態とデータ
 */
export const useChartData = () => {
    const [exercise, setExercise] = useState('ベンチプレス')
    const [mode, setMode] = useState<ChartMode>('daily')
    const [volumeData, setVolumeData] = useState<VolumePoint[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        /**
         * チャートデータを取得
         * 指定種目のメインセットとレストポーズセットを取得し、
         * モード（日別/週別/月別）に応じてグループ化して総負荷量を計算します
         */
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // 指定種目のメインセットとレストポーズセットを取得
                const { data, error } = await supabase
                    .from('sets')
                    .select('date, exercise, weight, reps, status')
                    .eq('exercise', exercise)
                    .in('status', ['メイン', 'レストポーズ'])
                    .order('date', { ascending: true })

                if (error) throw error
                if (!data) return

                // 日付ごと/週ごと/月ごとにデータをグループ化
                const grouped = new Map<string, { weight: number; reps: number }[]>()

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

                // 各セットを期間ごとにグループ化
                data.forEach(set => {
                    const key = getKey(set.date)
                    if (!grouped.has(key)) grouped.set(key, [])
                    grouped.get(key)?.push({
                        weight: parseFloat(set.weight),
                        reps: parseInt(set.reps),
                    })
                })

                const result: VolumePoint[] = []

                // 各期間の総負荷量を計算（重量 × 回数の合計）
                grouped.forEach((sets, label) => {
                    const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
                    result.push({ label, volume })
                })

                setVolumeData(result)
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
    }, [exercise, mode])

    return {
        exercise,
        setExercise,
        mode,
        setMode,
        volumeData,
        loading,
        error
    }
}
