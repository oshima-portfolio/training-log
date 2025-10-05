'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WeightForm() {
  const [weight, setWeight] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const router = useRouter()

  const handleSubmit = async () => {
    if (!weight) {
      alert('体重を入力してください')
      return
    }

    const { error } = await supabase.from('weights').insert([
      { date: today, weight: Number(weight) }
    ])

    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert('✅ 体重を記録しました！')
      setWeight('')
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold">⚖️ 体重記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      <div className="flex flex-col space-y-2">
        <label htmlFor="weight" className="font-medium">体重 (kg)</label>
        <input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="例: 55.2"
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          記録する
        </button>
      </div>

      {/* 🔙 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>
    </main>
  )
}
