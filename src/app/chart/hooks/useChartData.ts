import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { parseISO, getISOWeek, format } from 'date-fns'

export type VolumePoint = { label: string; volume: number }
export type ChartMode = 'daily' | 'weekly' | 'monthly'

export const useChartData = () => {
    const [exercise, setExercise] = useState('ベンチプレス')
    const [mode, setMode] = useState<ChartMode>('daily')
    const [volumeData, setVolumeData] = useState<VolumePoint[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const { data, error } = await supabase
                    .from('sets')
                    .select('date, exercise, weight, reps, status')
                    .eq('exercise', exercise)
                    .in('status', ['メイン', 'レストポーズ'])
                    .order('date', { ascending: true })

                if (error) throw error
                if (!data) return

                const grouped = new Map<string, { weight: number; reps: number }[]>()

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

                data.forEach(set => {
                    const key = getKey(set.date)
                    if (!grouped.has(key)) grouped.set(key, [])
                    grouped.get(key)?.push({
                        weight: parseFloat(set.weight),
                        reps: parseInt(set.reps),
                    })
                })

                const result: VolumePoint[] = []

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
