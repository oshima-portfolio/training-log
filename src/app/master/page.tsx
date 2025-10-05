'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Exercise = {
  id: string
  name: string
  category: string
}

type Status = {
  id: string
  name: string
}

export default function MasterPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchMasters = async () => {
      const { data: ex } = await supabase.from('exercises').select('*')
      const { data: st } = await supabase.from('statuses').select('*')
      setExercises(ex ?? [])
      setStatuses(st ?? [])
    }
    fetchMasters()
  }, [])

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">🛠️ マスタ管理</h1>

      {/* 種目一覧 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">🏋️‍♂️ 種目一覧</h2>
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">種目名</th>
              <th className="border px-3 py-2 text-left">カテゴリ</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map(ex => (
              <tr key={ex.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{ex.name}</td>
                <td className="border px-3 py-2">{ex.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ステータス一覧 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">📌 ステータス一覧</h2>
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">ステータス名</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(st => (
              <tr key={st.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{st.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>
    </main>
  )
}
