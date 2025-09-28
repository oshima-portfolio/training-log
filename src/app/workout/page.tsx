'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WorkoutForm() {
  const [exercises, setExercises] = useState([])
  const [statuses, setStatuses] = useState([])

  const [exercise, setExercise] = useState('')
  const [status, setStatus] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [note, setNote] = useState('')
  const [setNumber, setSetNumber] = useState('')
  const [exerciseOrder, setExerciseOrder] = useState('')

  const today = new Date().toISOString().split('T')[0]

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
      alert('記録しました！')
      setExercise('')
      setStatus('')
      setWeight('')
      setReps('')
      setNote('')
      setSetNumber('')
      setExerciseOrder('')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-4">💪 筋トレ記録</h1>
      <p>日付: {today}</p>

      <label>種目:</label>
      <select value={exercise} onChange={e => setExercise(e.target.value)}>
        <option value="">選択してください</option>
        {exercises.map(e => (
          <option key={e.id} value={e.name}>{e.name}</option>
        ))}
      </select>

      <label>ステータス:</label>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">選択してください</option>
        {statuses.map(s => (
          <option key={s.id} value={s.name}>{s.name}</option>
        ))}
      </select>

      {status === 'メイン' && (
        <>
          <label>セット番号:</label>
          <input type="number" value={setNumber} onChange={e => setSetNumber(e.target.value)} />
        </>
      )}

      <label>重量 (kg):</label>
      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} />

      <label>回数 (rep):</label>
      <input type="number" value={reps} onChange={e => setReps(e.target.value)} />

      <label>備考:</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} />

      <label>種目順序:</label>
      <input type="number" value={exerciseOrder} onChange={e => setExerciseOrder(e.target.value)} />

      <button onClick={handleSubmit}>記録する</button>
    </main>
  )
}
