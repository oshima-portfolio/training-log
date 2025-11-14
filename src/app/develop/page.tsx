'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Set = {
  id: string
  date: string
  exercise: string
  weight: number
  reps: number
  set_number: number | null
}

export default function DevelopPage() {
  const [sets, setSets] = useState<Set[]>([])
  const [audio] = useState(() => new Audio('/sound/Cell_Phone-Vibration03-04.mp3')) // ← mp3のパスを指定

  useEffect(() => {
    const fetchTodaySets = async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('sets')
        .select('id, date, exercise, weight, reps, set_number')
        .in('status', ['メイン'])
        .order('weight', { ascending: false })

      if (data) setSets(data)
    }

    fetchTodaySets()
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🧪 技術実験ページ</h1>

      {/* ✅ バイブ＋音声テストボタン */}
      <button
        onClick={() => {
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
          }
          audio.play() // ← 音声再生
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        バイブ＋音声テスト
      </button>

      {/* セット表示テーブル */}
      <table className="min-w-full table-auto border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">日付</th>
            <th className="border px-3 py-2 text-left">種目</th>
            <th className="border px-3 py-2 text-right">重量 (kg)</th>
            <th className="border px-3 py-2 text-right">レップ数</th>
            <th className="border px-3 py-2 text-right">セット番号</th>
          </tr>
        </thead>
        <tbody>
          {sets.map(set => (
            <tr key={set.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{set.date}</td>
              <td className="border px-3 py-2">{set.exercise}</td>
              <td className="border px-3 py-2 text-right">{set.weight}</td>
              <td className="border px-3 py-2 text-right">{set.reps}</td>
              <td className="border px-3 py-2 text-right">{set.set_number ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
