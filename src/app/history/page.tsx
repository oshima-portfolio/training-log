'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

type Weight = {
  date: string
  weight: number
}

export default function HistoryPage() {
  const [sets, setSets] = useState<Set[]>([])
  const [filteredSets, setFilteredSets] = useState<Set[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [exercises, setExercises] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])

  const [filterExercise, setFilterExercise] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
        .order('exercise_order', { ascending: true })

      const { data: weightsData } = await supabase.from('weights').select('*')
      const { data: exData } = await supabase.from('exercises').select('name')
      const { data: stData } = await supabase.from('statuses').select('name')

      const weightMap: Record<string, number> = {}
      weightsData?.forEach(w => {
        const date = new Date(w.date).toISOString().split('T')[0]
        weightMap[date] = w.weight
      })

      setSets(setsData ?? [])
      setFilteredSets(setsData ?? [])
      setWeights(weightMap)
      setExercises(exData?.map(e => e.name) ?? [])
      setStatuses(stData?.map(s => s.name) ?? [])
    }

    fetchData()
  }, [])

  const handleFilter = () => {
    const filtered = sets.filter(set => {
      const date = new Date(set.date).toISOString().split('T')[0]
      return (
        (!filterExercise || set.exercise === filterExercise) &&
        (!filterStatus || set.status === filterStatus) &&
        (!filterStartDate || date >= filterStartDate) &&
        (!filterEndDate || date <= filterEndDate)
      )
    })
    setFilteredSets(filtered)
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">📈 筋トレ履歴</h1>

      {/* 🔍 検索フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">種目</label>
          <select value={filterExercise} onChange={e => setFilterExercise(e.target.value)} className="w-full border p-2 rounded">
            <option value="">すべて</option>
            {exercises.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">ステータス</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border p-2 rounded">
            <option value="">すべて</option>
            {statuses.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">開始日</label>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">終了日</label>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full border p-2 rounded" />
        </div>
      </div>

      <button onClick={handleFilter} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        絞り込む
      </button>

      {/* 📋 表表示 */}
<div className="overflow-x-auto">
  <table className="min-w-full table-auto border border-gray-300 text-sm mt-4">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th className="border px-3 py-2 whitespace-nowrap">日付</th>
        <th className="border px-3 py-2 whitespace-nowrap">順序</th>
        <th className="border px-3 py-2 whitespace-nowrap">体重</th>
        <th className="border px-3 py-2 whitespace-nowrap">種目</th>
        <th className="border px-3 py-2 whitespace-nowrap">ステータス</th>
        <th className="border px-3 py-2 whitespace-nowrap">セット</th>
        <th className="border px-3 py-2 whitespace-nowrap">重量</th>
        <th className="border px-3 py-2 whitespace-nowrap">回数</th>
        <th className="border px-3 py-2 whitespace-nowrap">備考</th>
      </tr>
    </thead>
    <tbody>
      {filteredSets.length === 0 ? (
        <tr>
          <td colSpan={9} className="text-center py-4 text-gray-500">
            条件に一致するデータがありません
          </td>
        </tr>
      ) : (
        filteredSets.map(set => {
          const date = new Date(set.date).toISOString().split('T')[0]
          const weight = weights[date]
          return (
            <tr key={set.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{date}</td>
              <td className="border px-3 py-2 text-center">{set.exercise_order}</td>
              <td className="border px-3 py-2 text-center">{weight ?? '-'}</td>
              <td className="border px-3 py-2">{set.exercise}</td>
              <td className="border px-3 py-2 text-center">{set.status}</td>
              <td className="border px-3 py-2 text-center">{set.set_number ?? '-'}</td>
              <td className="border px-3 py-2 text-center">{set.weight}</td>
              <td className="border px-3 py-2 text-center">{set.reps}</td>
              <td className="border px-3 py-2 max-w-xs break-words">{set.note || '-'}</td>
            </tr>
          )
        })
      )}
    </tbody>
  </table>
</div>
      {/* 🔙 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="text-blue-600 underline hover:text-blue-800 transition text-sm"
      >
        ← 戻る
      </button>

    </main>
  )
}
