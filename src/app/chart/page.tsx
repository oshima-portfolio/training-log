'use client'
import { useEffect, useState } from 'react'
import VolumeChart from '@/components/VolumeChart'
import { supabase } from '@/lib/supabase'
import { parseISO, getISOWeek, format } from 'date-fns'
import { useRouter } from 'next/navigation'

type Set = {
  date: string
  exercise: string
  weight: string
  reps: string
  status: string
}

type VolumePoint = { label: string; volume: number }

export default function ChartPage() {
  const [exercise, setExercise] = useState('ベンチプレス')
  const [mode, setMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [volumeData, setVolumeData] = useState<VolumePoint[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('date, exercise, weight, reps, status')
        .eq('exercise', exercise)
        .in('status', ['メイン', 'レストポーズ'])
        .order('date', { ascending: true })

      if (error || !data) return

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
        // ✅ 全メインセットの合計負荷量
        const volume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
        result.push({ label, volume })
      })

      setVolumeData(result)
    }

    fetchData()
  }, [exercise, mode])

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📈 総負荷量グラフ</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">種目を選択</label>
          <select
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            className="border p-2 rounded w-full max-w-xs"
          >
            {['ベンチプレス', 'スクワット', 'デッドリフト'].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">表示モード</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="border p-2 rounded w-full max-w-xs"
          >
            <option value="daily">日別</option>
            <option value="weekly">週別</option>
            <option value="monthly">月別</option>
          </select>
        </div>
      </div>

      {volumeData.length > 0 ? (
        <div className="bg-white border rounded-lg shadow p-4 w-full max-w-4xl">
          <VolumeChart
            data={volumeData}
            title={`${exercise}の${mode === 'daily' ? '日別' : mode === 'weekly' ? '週別' : '月別'}総負荷量`}
          />
        </div>
      ) : (
        <p className="text-gray-500 mt-4">記録がまだありません</p>
      )}

      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>
    </main>
  )
}
