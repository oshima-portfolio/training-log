'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WorkoutForm() {
  type Exercise = {
    exercises_id: number
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
      const { data: ex } = await supabase
        .from('exercises')
        .select('exercises_id, name, category')
        .order('exercises_id', { ascending: true })

      const { data: st } = await supabase
        .from('statuses')
        .select('*')
        .order('statuses_id', { ascending: true })

      setExercises(ex ?? [])
      setStatuses(st ?? [])
    }
    fetchMasters()
  }, [])

  // 種目が変わったら種目順序を自動設定
  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('id')
        .eq('date', today)

      if (error) {
        console.error('順序取得失敗:', error.message)
        return
      }

      const count = data?.length ?? 0
      setExerciseOrder(String(count + 1))
    }

    fetchOrder()
  }, [exercise, status, weight, reps]) // ← 依存関係を広げるとより確実

  // ステータスと種目が変わったら前回の重量と今日のセット番号を自動設定（メインのみ）
  useEffect(() => {
    const fetchAutoValues = async () => {
      if (status !== 'メイン' || !exercise) return

      // 前回の重量（今日以外の最新）
      const { data: previousData, error: previousError } = await supabase
        .from('sets')
        .select('date, weight')
        .eq('exercise', exercise)
        .eq('status', 'メイン')
        .order('date', { ascending: false })

      if (previousError) {
        console.error('前回重量取得失敗:', previousError.message)
      } else {
        const previous = previousData?.find(d => {
          const recordDate = new Date(d.date).toISOString().split('T')[0]
          return recordDate !== today
        })
        if (previous) {
          setWeight(String(previous.weight))
        } else {
          setWeight('')
        }
      }

      // 今日のセット番号
      const { data: todayData, error: todayError } = await supabase
        .from('sets')
        .select('set_number')
        .eq('date', today)
        .eq('exercise', exercise)
        .eq('status', 'メイン')

      if (todayError) {
        console.error('セット番号取得失敗:', todayError.message)
      } else {
        const count = todayData?.length ?? 0
        setSetNumber(String(count + 1))
      }
    }

    fetchAutoValues()
  }, [status, exercise])

  const handleSubmit = async () => {
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
      setReps('')

      // メインの場合は次のセット番号を自動更新
      if (status === 'メイン') {
        setSetNumber(prev => String(Number(prev) + 1))
      }
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
              <option key={e.exercises_id} value={e.name}>
                【{e.category}】 {e.name}
              </option>
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
          <select value={reps} onChange={e => setReps(e.target.value)} className="w-full border p-2 rounded">
            <option value="">選択してください</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">備考（任意）</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">種目順序 <span className="text-red-500">*</span></label>
          <input type="number" value={exerciseOrder} readOnly className="w-full border p-2 rounded bg-gray-100" />
        </div>

        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          記録する
        </button>

        <button onClick={() => router.back()} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          戻る
        </button>
      </div>
    </main>
  )
}
