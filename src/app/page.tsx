/*Reactコンポーネント*/
'use client'
/*Next.jsのLinkコンポーネントをインポート、ページ遷移を高速化するらしい*/
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

type Weight = {
  date: string
  weight: number
}


/*Reactコンポーネント*/
export default function Home() {
  const [lastRecords, setLastRecords] = useState<
    { exercise: string; maxWeight: number; daysAgo: number }[]
  >([])
  
useEffect(() => {
  const fetchLastRecords = async () => {
    const { data: setsData } = await supabase
      .from('sets')
      .select('*')
      .order('date', { ascending: false })

    if (!setsData) return

    const today = new Date()
    const targetExercises = ['ベンチプレス', 'スクワット', 'デッドリフト']
    const records: { exercise: string; maxWeight: number; daysAgo: number }[] = []

    targetExercises.forEach(exercise => {
      // メインセットのみ抽出
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


  return (
    /*
    min-h-screen                :画面の高さいっぱいに広げる
    flex flex-col               :Flexboxで縦並びレイアウト
    items-center justify-center :中央揃え（縦横）
    bg-gray-50                  :薄いグレーの背景色
    p-6                         :パディング（内側の余白）
    space-y-8                   :子要素間の縦方向スペース
    */
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-8">
      {/*
      text-2xl      :文字サイズを大きく
      font-bold     :太字
      text-gray-800:濃いグレーの文字色
      */}
      <h1 className="text-2xl font-bold text-gray-800">🏋️ トレーニング記録</h1>
      {/*
      <div>タグ
      grid:グリッドレイアウト
      grid-cols-1:1列（モバイル）
      sm:grid-cols-2:2列（スマホ以上）
      md:grid-cols-3:3列（タブレット以上）
      gap-4:要素間のスペース
      w-full max-w-3xl:幅を最大3XLまでに制限

        <Link>タグ
        bg-white:白背景
        border:枠線あり
        rounded-lg:角丸
        shadow hover:shadow-md:影付き＋ホバー時に強調
        p-4 text-center:パディング＋中央揃え
        hover:bg-red-50:ホバー時の背景色変化
        transition:ホバー時のアニメーション効果
      */}
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
          🗂️ CSV出力※未実装
        </Link>
        <Link href="/master" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-100 transition">
          🛠️ マスタ管理
        </Link>
      </div>
      {/* 🕒 前回の記録 */}
      <div className="bg-white border rounded-lg shadow p-4 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">前回メインセット</h2>
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">BIG3</th>
              <th className="border px-3 py-2 text-right">メイン重量 (kg)</th>
              <th className="border px-3 py-2 text-right">経過日数</th>
            </tr>
          </thead>
          <tbody>
            {lastRecords.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  記録がまだありません
                </td>
              </tr>
            ) : (
              lastRecords.map(record => (
                <tr key={record.exercise} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{record.exercise}</td>
                  <td className="border px-3 py-2 text-right">{record.maxWeight}</td>
                  <td className="border px-3 py-2 text-right">{record.daysAgo} 日前</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
