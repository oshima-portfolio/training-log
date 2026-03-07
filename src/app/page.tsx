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
  const [lastRecords, setLastRecords] = useState<
    { exercise: string; maxWeight: number; daysAgo: number }[]
  >([])
  const [todaySets, setTodaySets] = useState<Set[]>([])

  // BIG3の最新記録を取得
  useEffect(() => {
    const fetchLastRecords = async () => {
      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
      if (!setsData) return

      const today = new Date(getTodayJST())
      const targetExercises = ['ベンチプレス', 'スクワット', 'デッドリフト']
      const records: { exercise: string; maxWeight: number; daysAgo: number }[] = []

      targetExercises.forEach(exercise => {
        const mainSets = setsData
          .filter(set => set.exercise === exercise && set.status === 'メイン')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (mainSets.length > 0) {
          const latestDate = mainSets[0].date
          const latestMainSets = mainSets.filter(s => s.date === latestDate)
          const maxWeight = Math.max(...latestMainSets.map(s => s.weight))
          const daysAgo = Math.floor(
            (today.getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
          )
          records.push({ exercise, maxWeight, daysAgo })
        }
      })

      setLastRecords(records)
    }

    fetchLastRecords()
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
        <Link href="/weight" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          ⚖️ 体重記録
        </Link>
        <Link href="/chart" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          📊 グラフ表示
        </Link>
        <Link href="/history" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          📝 履歴表示
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

      {/* BIG3メインセット */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">BIG3メインセット</h2>
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">種目</th>
              <th className="border px-3 py-2 text-right">メイン重量 (kg)</th>
              <th className="border px-3 py-2 text-right">経過日数</th>
            </tr>
          </thead>
          <tbody>
            {['ベンチプレス', 'スクワット', 'デッドリフト'].map(exercise => {
              const record = lastRecords.find(r => r.exercise === exercise)
              const weight = record?.maxWeight ?? '0'
              const daysAgo = record?.daysAgo ?? '0'

              return (
                <tr key={exercise} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{exercise}</td>
                  <td className="border px-3 py-2 text-right">{weight}</td>
                  <td className="border px-3 py-2 text-right">{daysAgo} 日前</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 今日の記録（全種目） */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">今日の記録（全種目）</h2>
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
