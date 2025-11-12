'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Set = {
  id: string
  date: string
  exercise: string
  weight: number
  reps: number
  set_number: number | null
  status: string
  note: string
  exercise_order: number
}

type WeightLog = {
  date: string
  weight: number
}

export default function CsvPage() {
  const [sets, setSets] = useState<Set[]>([])
  const [weightsMap, setWeightsMap] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: setsData, error: setsError } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
        .order('exercise_order', { ascending: true })

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const handleDownload = () => {
    const header = ['date', 'body_weight', 'exercise', 'set_number', 'weight', 'reps', 'status', 'note', 'exercise_order']

    const rows = sets.map(set => {
      const dateKey = formatDate(set.date)
      const bodyWeight = weightsMap[dateKey] ?? '-'

      return [
        dateKey,
        bodyWeight,
        set.exercise,
        set.set_number ?? '',
        set.weight,
        set.reps,
        set.status,
        set.note ?? '',
        set.exercise_order
      ]
    })

    const csvContent =
      [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.setAttribute('download', `training_log_${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">🗂️ CSV出力</h1>

      <div className="flex flex-col items-start space-y-2 mt-2">
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          📥 ダウンロード
        </button>

        <button
          onClick={() => router.back()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          戻る
        </button>
      </div>
    </main>
  )
}
