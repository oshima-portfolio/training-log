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

export default function HistoryPage() {
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

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">📈 筋トレ履歴（表形式）</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">日付</th>
              <th className="border px-3 py-2 text-left">種目</th>
              <th className="border px-3 py-2 text-center">セット</th>
              <th className="border px-3 py-2 text-center">重量 (kg)</th>
              <th className="border px-3 py-2 text-center">回数</th>
              <th className="border px-3 py-2 text-center">ステータス</th>
              <th className="border px-3 py-2 text-left">備考</th>
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
                <td className={`border px-3 py-2 text-center ${set.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {set.status === 'success' ? '✅ 成功' : '❌ 失敗'}
                </td>
                <td className="border px-3 py-2">{set.note || '-'}</td>
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
