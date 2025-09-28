'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WeightForm() {
  const [weight, setWeight] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    const { error } = await supabase.from('weights').insert([
      {
        date: today,
        weight: Number(weight)
      }
    ])
    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert('体重を記録しました！')
      setWeight('')
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>⚖️ 体重記録</h1>
      <p>日付: {today}</p>

      <label>体重 (kg):</label>
      <input
        type="number"
        value={weight}
        onChange={e => setWeight(e.target.value)}
      />

      <button onClick={handleSubmit}>記録する</button>
    </main>
  )
}
