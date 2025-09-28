'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type SetRecord = {
  id: number
  date: string
  exercise: string
  status: string
  set_number?: number
  weight: number
  reps: number
  note?: string
  exercise_order?: number
}

export default function HistoryPage() {
  const [records, setRecords] = useState<SetRecord[]>([])

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
        .order('exercise_order', { ascending: true })
      if (!error && data) {
        setRecords(data)
      }
    }
    fetchRecords()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-4">📈 筋トレ履歴</h1>

      {records.length === 0 ? (
        <p>記録がまだありません。</p>
      ) : (
        <ul className="space-y-4">
          {records.map((r) => (
            <li key={r.id} className="border-b border-white/20 pb-2">
              <div>📅 {r.date}</div>
              <div>🏋️‍♂️ 種目: {r.exercise}</div>
              <div>📌 ステータス: {r.status}</div>
              {r.set_number && <div>🔢 セット: {r.set_number}</div>}
              <div>⚖️ 重量: {r.weight} kg</div>
              <div>🔁 回数: {r.reps} 回</div>
              {r.note && <div>📝 備考: {r.note}</div>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
