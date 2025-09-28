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

export default function CsvPage() {
  const [sets, setSets] = useState<Set[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSets = async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
        .order('exercise_order', { ascending: true })

      if (error) {
        console.error('取得失敗:', error.message)
      } else {
        setSets(data ?? [])
      }
    }

    fetchSets()
  }, [])

  const handleDownload = () => {
    const header = ['date', 'exercise', 'set_number', 'weight', 'reps', 'status', 'note', 'exercise_order']
    const rows = sets.map(set => [
      new Date(set.date).toLocaleDateString(),
      set.exercise,
      set.set_number ?? '',
      set.weight,
      set.reps,
      set.status,
      set.note ?? '',
      set.exercise_order
    ])

    const csvContent =
      [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'training_log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">🗂️ CSV出力</h1>

      <button
        onClick={handleDownload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        📥 ダウンロード
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">日付</th>
              <th className="border px-3 py-2">種目</th>
              <th className="border px-3 py-2">セット</th>
              <th className="border px-3 py-2">重量</th>
              <th className="border px-3 py-2">回数</th>
              <th className="border px-3 py-2">ステータス</th>
              <th className="border px-3 py-2">備考</th>
              <th className="border px-3 py-2">順序</th>
            </tr>
          </thead>
          <tbody>
            {sets.map(set => (
              <tr key={set.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{new Date(set.date).toLocaleDateString()}</td>
                <td className="border px-3 py-2">{set.exercise}</td>
                <td className="border px-3 py-2 text-center">{set.set_number ?? '-'}</td>
                <td className="border px-3 py-2 text-center">{set.weight}</td>
                <td className="border px-3 py-2 text-center">{set.reps}</td>
                <td className="border px-3 py-2 text-center">{set.status}</td>
                <td className="border px-3 py-2">{set.note || '-'}</td>
                <td className="border px-3 py-2 text-center">{set.exercise_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.back()}
        className="text-blue-600 underline hover:text-blue-800 transition text-sm"
      >
        ← 戻る
      </button>
    </main>
  )
}
