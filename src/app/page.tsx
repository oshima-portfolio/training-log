/*Reactコンポーネント*/
'use client'
/*Next.jsのLinkコンポーネントをインポート、ページ遷移を高速化するらしい*/
import Link from 'next/link'
/*reactを使用できるようにする*/
import { useEffect, useState } from 'react'
/*supabaseの連携用*/
import { supabase } from '@/lib/supabase'

/*型定義*/
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

/*Reactコンポーネント*/
export default function Home() {
  const [lastRecords, setLastRecords] = useState<
    { exercise: string; maxWeight: number; daysAgo: number }[]
  >([])
  
useEffect(() => {
  /*setsテーブルから全データを取得し、日付の降順で並べ替え。*/
  const fetchLastRecords = async () => {
    const { data: setsData } = await supabase
      .from('sets')
      .select('*')
      .order('date', { ascending: false })
    if (!setsData) return

    /*今日の日付を記録*/
    const today = new Date()
    /*対象種目の抽出※マスタ管理にしたいけど今回は一旦割愛*/
    const targetExercises = ['ベンチプレス', 'スクワット', 'デッドリフト']
    /*最新記録の抽出*/
    const records: { exercise: string; maxWeight: number; daysAgo: number }[] = []

    /*
    最新のBIG3の記録を取得
    メインセットで一番新しい日付グループのデータに対し、一番重い重量をメインセットの重量とする
    また、一番新しい日付を現在の日付を比較し経過日数を計算する

    exercise :種目
    maxWeight:最大重量
    daysAgo  :経過日数
    */
    targetExercises.forEach(exercise => {
      const mainSets = setsData
        /*メインセットのみ抽出*/
        .filter(set => set.exercise === exercise && set.status === 'メイン')
        /*日付を新しい順に並べ替え*/
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      if (mainSets.length > 0) {
        /*一番新しい日付を取得*/
        const latestDate = mainSets[0].date
        /*同一日付のセットをまとめる*/
        const latestMainSets = mainSets.filter(s => s.date === latestDate)
        /*最大重量を抽出*/
        const maxWeight = Math.max(...latestMainSets.map(s => s.weight))
        /*本日と比べて何日前かを計算*/
        const daysAgo = Math.floor(
          (today.getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        
        /*recordsにデータを追加*/
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
      {/*メインセットの記録 */}
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
            {lastRecords.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  記録がまだありません
                </td>
              </tr>
            ) : (
              lastRecords.map(record => (
                /*種目を軸に表にデータを挿入*/
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
