'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WeightForm() {
  const [weight, setWeight] = useState('')
  const [history, setHistory] = useState<
    { date: string; weight: number; diffFromLastWeek: string | null; diffFromLastMonth: string | null }[]
  >([])
  const [monthlyAverages, setMonthlyAverages] = useState<
    { month: string; average: string }[]
  >([])
  const [lastWeight, setLastWeight] = useState<number | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const router = useRouter()

  // 🔄 全データ取得して履歴と前回体重を処理
  useEffect(() => {
    const fetchWeights = async () => {
      const { data, error } = await supabase
        .from('weights')
        .select('date, weight')
        .order('date', { ascending: false })

      if (error) {
        console.error('取得失敗:', error.message)
        return
      }

      const enriched = (data ?? []).map((entry, _, all) => {
        const currentDate = new Date(entry.date)

        // 前週比
        const weekAgoStart = new Date(currentDate)
        weekAgoStart.setDate(currentDate.getDate() - 7)
        const weekAgoEnd = new Date(currentDate)
        weekAgoEnd.setDate(currentDate.getDate() - 1)

        const pastWeek = all.filter(e => {
          const d = new Date(e.date)
          return d >= weekAgoStart && d <= weekAgoEnd
        })

        const avgWeek =
          pastWeek.reduce((sum, e) => sum + e.weight, 0) /
          (pastWeek.length || 1)

        const diffWeek = entry.weight - avgWeek

        // 先月比
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const lastMonthStart = new Date(year, month - 1, 1)
        const lastMonthEnd = new Date(year, month, 0)

        const lastMonthData = all.filter(e => {
          const d = new Date(e.date)
          return d >= lastMonthStart && d <= lastMonthEnd
        })

        const avgMonth =
          lastMonthData.reduce((sum, e) => sum + e.weight, 0) /
          (lastMonthData.length || 1)

        const diffMonth = entry.weight - avgMonth

        return {
          ...entry,
          diffFromLastWeek:
            pastWeek.length === 0 ? null : diffWeek.toFixed(1),
          diffFromLastMonth:
            lastMonthData.length === 0 ? null : diffMonth.toFixed(1)
        }
      })

      // 表示は直近1か月分に絞る
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const filtered = enriched.filter(e => new Date(e.date) >= oneMonthAgo)

      setHistory(filtered)

      // 前回体重をセット（今日以外で最新のもの）
      const previous = (data ?? []).find(e => e.date !== today)
      if (previous) setLastWeight(previous.weight)

      // 📊 月ごとの平均体重を計算
      const monthMap = new Map<string, { total: number; count: number }>()

        ; (data ?? []).forEach(e => {
          const d = new Date(e.date)
          const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM

          const current = monthMap.get(yearMonth) || { total: 0, count: 0 }
          monthMap.set(yearMonth, {
            total: current.total + e.weight,
            count: current.count + 1
          })
        })

      const averages = Array.from(monthMap.entries())
        .map(([month, stats]) => ({
          month,
          average: (stats.total / stats.count).toFixed(1)
        }))
        .sort((a, b) => b.month.localeCompare(a.month)) // 新しい月順

      setMonthlyAverages(averages)
    }

    fetchWeights()
  }, [])

  // 🔄 体重登録（insert or update）
  const handleSubmit = async () => {
    if (!weight) {
      alert('体重を選択してください')
      return
    }

    const { data: existing } = await supabase
      .from('weights')
      .select('id')
      .eq('date', today)
      .limit(1)
      .single()

    let error
    if (existing) {
      const { error: updateError } = await supabase
        .from('weights')
        .update({ weight: Number(weight) })
        .eq('id', existing.id)
      error = updateError
    } else {
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

  // 🔢 体重選択リスト生成（30kg〜150kg）
  const weightOptions = Array.from({ length: 1201 }, (_, i) => (30 + i * 0.1).toFixed(1))

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold">⚖️ 体重記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      <div className="flex flex-col space-y-2">
        <label htmlFor="weight" className="font-medium">体重 (kg)</label>
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

      <button
        onClick={() => router.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">📅 月別平均体重</h2>
        {monthlyAverages.length === 0 ? (
          <p className="text-gray-500">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-blue-50">
                <tr>
                  <th className="border px-4 py-2">年月</th>
                  <th className="border px-4 py-2">平均体重 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyAverages.map((entry, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border px-4 py-2">{entry.month}</td>
                    <td className="border px-4 py-2">{entry.average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">📊 直近1か月の記録</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">まだ記録がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">日付</th>
                  <th className="border px-4 py-2">体重 (kg)</th>
                  <th className="border px-4 py-2">前週比</th>
                  <th className="border px-4 py-2">先月比</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => {
                  const formatDiff = (diff: string | null) => {
                    if (diff === null) return '—'
                    const num = parseFloat(diff)
                    const color =
                      num > 0
                        ? 'text-red-600'
                        : num < 0
                          ? 'text-blue-600'
                          : 'text-gray-600'
                    return (
                      <span className={color}>
                        {num > 0 ? '+' : ''}
                        {diff} kg
                      </span>
                    )
                  }

                  return (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="border px-4 py-2">{entry.date}</td>
                      <td className="border px-4 py-2">{entry.weight}</td>
                      <td className="border px-4 py-2">
                        {formatDiff(entry.diffFromLastWeek)}
                      </td>
                      <td className="border px-4 py-2">
                        {formatDiff(entry.diffFromLastMonth)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
