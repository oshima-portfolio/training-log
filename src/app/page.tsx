'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayJST } from '@/utils/date'

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

export default function Home() {
  const [partDaysAgo, setPartDaysAgo] = useState<
    { part: string; daysAgo: number }[]
  >([])
  const [todaySets, setTodaySets] = useState<Set[]>([])

  // 部位ごとの最終トレーニング日からの経過日数を取得
  useEffect(() => {
    const fetchPartDaysAgo = async () => {
      const { data: exercisesData } = await supabase.from('exercises').select('*')
      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })

      if (!exercisesData || !setsData) return

      const exerciseToCategory: Record<string, string> = {}
      exercisesData.forEach(ex => {
        exerciseToCategory[ex.name] = ex.category
      })

      // BIG3は特定の部位としてカウント
      const overrides: Record<string, string> = {
        'ベンチプレス': '胸',
        'デッドリフト': '背中',
        'スクワット': '脚',
      }

      const latestDatesByPart: Record<string, string> = {}

      setsData.forEach(set => {
        const exercise = set.exercise
        const category = overrides[exercise] || exerciseToCategory[exercise]

        if (!category) return

        if (!latestDatesByPart[category]) {
          latestDatesByPart[category] = set.date
        } else {
          if (new Date(set.date) > new Date(latestDatesByPart[category])) {
            latestDatesByPart[category] = set.date
          }
        }
      })

      const today = new Date(getTodayJST())

      const records: { part: string; daysAgo: number }[] = Object.entries(latestDatesByPart).map(([part, date]) => {
        const daysAgo = Math.floor(
          (today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
        )
        return { part, daysAgo }
      })

      // 経過日数が長い順にソート（放置している部位を上に）
      records.sort((a, b) => b.daysAgo - a.daysAgo)

      setPartDaysAgo(records)
    }

    fetchPartDaysAgo()
  }, [])

  // 今日の全種目の記録を取得
  useEffect(() => {
    const fetchTodaySets = async () => {
      const today = getTodayJST()

      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .eq('date', today)
        .in('status', ['メイン', 'レストポーズ'])

      if (setsData) setTodaySets(setsData)
    }

    fetchTodaySets()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">🏋️ トレーニング記録</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <Link href="/workout" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          💪 筋トレ記録
        </Link>
        <Link href="/dropset" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-blue-50 transition">
          🔥 短時間用筋トレ記録
        </Link>
        <Link href="/weight" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          ⚖️ 体重記録
        </Link>
        <Link href="/chart" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          📊 グラフ表示
        </Link>
        <Link href="/history" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          📝 履歴表示
        </Link>
        <Link href="/chat" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-purple-50 transition">
          🤖 AIコーチング
        </Link>
        <Link href="/csv" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          🗂️ CSV出力
        </Link>
        <Link href="/master" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-100 transition">
          🛠️ マスタ管理
        </Link>
        <Link href="/develop" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-100 transition">
          🧪 実験用ページ
        </Link>
      </div>

      {/* 部位ごとの経過日数 */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">トレーニング頻度</h2>
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">部位</th>
              <th className="border px-3 py-2 text-right">経過日数</th>
            </tr>
          </thead>
          <tbody>
            {partDaysAgo.length > 0 ? (
              partDaysAgo.map(record => (
                <tr key={record.part} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{record.part}</td>
                  <td className="border px-3 py-2 text-right">{record.daysAgo} 日前</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="border px-3 py-2 text-center text-gray-500">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 今日の記録（全種目） */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">今日の記録</h2>
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">種目</th>
              <th className="border px-3 py-2 text-right">重量 (kg)</th>
              <th className="border px-3 py-2 text-right">セット番号</th>
              <th className="border px-3 py-2 text-right">レップ数</th>
            </tr>
          </thead>
          <tbody>
            {[...todaySets]
              .sort((a, b) => a.exercise_order - b.exercise_order)
              .map((set, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{set.exercise}</td>
                  <td className="border px-3 py-2 text-right">{set.weight}</td>
                  <td className="border px-3 py-2 text-right">{set.set_number ?? '—'}</td>
                  <td className="border px-3 py-2 text-right">{set.reps}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
