'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useWeightData } from './hooks/useWeightData'
import MonthlyAverageTable from './components/MonthlyAverageTable'
import WeightHistoryTable from './components/WeightHistoryTable'
import { getTodayJST } from '@/utils/date'

/**
 * 体重記録ページ
 * 
 * 体重の記録と履歴確認を行うページです。
 * 以下の機能を提供します：
 * - 体重の入力・保存（同日の場合は更新）
 * - 直近1ヶ月の記録と前週比・先月比の表示
 * - 月別平均体重の表示
 * - 前回体重の自動セット（デフォルト値）
 */
export default function WeightForm() {
  const router = useRouter()
  const today = getTodayJST()

  // フォーム入力値
  const [weight, setWeight] = useState('')

  // 体重データ（履歴、月次平均、前回体重）
  const { history, monthlyAverages, lastWeight } = useWeightData(today)

  /**
   * 体重選択リスト生成（30kg〜150kg、0.1kg刻み）
   */
  const weightOptions = Array.from({ length: 1201 }, (_, i) => (30 + i * 0.1).toFixed(1))

  /**
   * 体重登録ハンドラ
   * 既に今日の記録がある場合は更新、ない場合は新規登録します
   */
  const handleSubmit = async () => {
    if (!weight) {
      alert('体重を選択してください')
      return
    }

    // 今日の記録が既に存在するかチェック
    const { data: existing } = await supabase
      .from('weights')
      .select('id')
      .eq('date', today)
      .limit(1)
      .single()

    let error
    if (existing) {
      // 既存データを更新
      const { error: updateError } = await supabase
        .from('weights')
        .update({ weight: Number(weight) })
        .eq('id', existing.id)
      error = updateError
    } else {
      // 新規データを挿入
      const { error: insertError } = await supabase
        .from('weights')
        .insert([{ date: today, weight: Number(weight) }])
      error = insertError
    }

    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert('✅ 体重を記録しました！')
      setWeight('')
      location.reload()
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold">⚖️ 体重記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      {/* 体重入力フォーム */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="weight" className="font-medium">
          体重 (kg)
        </label>
        <select
          id="weight"
          value={weight || (lastWeight?.toFixed(1) ?? '')}
          onChange={e => setWeight(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {weightOptions.map(w => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          記録する
        </button>
      </div>

      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>

      {/* 月別平均体重 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">📅 月別平均体重</h2>
        <MonthlyAverageTable data={monthlyAverages} />
      </section>

      {/* 直近1ヶ月の記録 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">📊 直近1か月の記録</h2>
        <WeightHistoryTable data={history} />
      </section>
    </main>
  )
}
