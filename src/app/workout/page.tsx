'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WorkoutForm() {
type Exercise = {
  id: string
    name: string
    category: string
  }

  type Status = {
    id: string
    name: string
  }
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])

  const [exercise, setExercise] = useState('')
  const [status, setStatus] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [note, setNote] = useState('')
  const [setNumber, setSetNumber] = useState('')
  const [exerciseOrder, setExerciseOrder] = useState('')

  const today = new Date().toISOString().split('T')[0]
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

  const handleSubmit = async () => {
    // 必須項目チェック
    if (
      !exercise ||
      !status ||
      !weight ||
      !reps ||
      !exerciseOrder ||
      (status === 'メイン' && !setNumber)
    ) {
      alert('⚠️ 必須項目が未入力です。すべて入力してください。')
      return
    }

    const { error } = await supabase.from('sets').insert([
      {
        date: today,
        exercise,
        status,
        weight: Number(weight),
        reps: Number(reps),
        note,
        set_number: status === 'メイン' ? Number(setNumber) : null,
        exercise_order: Number(exerciseOrder)
      }
    ])

    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert('✅ 記録しました！')
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-gray-800">💪 筋トレ記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">種目 <span className="text-red-500">*</span></label>
          <select value={exercise} onChange={e => setExercise(e.target.value)} className="w-full border p-2 rounded">
            <option value="">選択してください</option>
            {exercises.map(e => (
              <option key={e.id} value={e.name}>{e.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">ステータス <span className="text-red-500">*</span></label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-2 rounded">
            <option value="">選択してください</option>
            {statuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {status === 'メイン' && (
          <div>
            <label className="block font-medium mb-1">セット番号 <span className="text-red-500">*</span></label>
            <input type="number" value={setNumber} onChange={e => setSetNumber(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">重量 (kg) <span className="text-red-500">*</span></label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">回数 (rep) <span className="text-red-500">*</span></label>
          <input type="number" value={reps} onChange={e => setReps(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">備考（任意）</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">種目順序 <span className="text-red-500">*</span></label>
          <input type="number" value={exerciseOrder} onChange={e => setExerciseOrder(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          記録する
        </button>

        <button onClick={() => router.back()} className="text-blue-600 underline hover:text-blue-800 transition text-sm mt-2">
          ← 戻る
        </button>
      </div>
    </main>
  )
}
