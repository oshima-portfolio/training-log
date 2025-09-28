'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MasterPage() {
  const [exercises, setExercises] = useState([])
  const [statuses, setStatuses] = useState([])

  const [newExercise, setNewExercise] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const fetchMasters = async () => {
      const { data: ex } = await supabase.from('exercises').select('*')
      const { data: st } = await supabase.from('statuses').select('*')
      setExercises(ex ?? [])
      setStatuses(st ?? [])
    }
    fetchMasters()
  }, [])

  const addExercise = async () => {
    if (!newExercise) return
    const { error } = await supabase.from('exercises').insert([
      { name: newExercise, category: newCategory }
    ])
    if (!error) {
      setNewExercise('')
      setNewCategory('')
      const { data: ex } = await supabase.from('exercises').select('*')
      setExercises(ex ?? [])
    }
  }

  const addStatus = async () => {
    if (!newStatus) return
    const { error } = await supabase.from('statuses').insert([
      { name: newStatus }
    ])
    if (!error) {
      setNewStatus('')
      const { data: st } = await supabase.from('statuses').select('*')
      setStatuses(st ?? [])
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-6">🛠 マスタ管理</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">🏋️ 種目マスタ</h2>
        <input
          placeholder="種目名"
          value={newExercise}
          onChange={e => setNewExercise(e.target.value)}
          className="text-black mb-2"
        />
        <input
          placeholder="カテゴリ（任意）"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="text-black mb-2"
        />
        <button onClick={addExercise}>追加</button>

        <ul className="mt-4">
          {exercises.map(e => (
            <li key={e.id}>{e.name}（{e.category || '未分類'}）</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">📌 ステータスマスタ</h2>
        <input
          placeholder="ステータス名"
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          className="text-black mb-2"
        />
        <button onClick={addStatus}>追加</button>

        <ul className="mt-4">
          {statuses.map(s => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
