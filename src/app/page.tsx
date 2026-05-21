'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTodayJST } from '@/utils/date'
import { calculatePartDaysAgo } from '@/app/topPageUtil'

// 今日のトレーニング実施内容（種目・重量・回数など）のリストを格納するステートの定義
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

// 画面表示時に一度だけ実行
export default function Home() {
  // 部位ごとの放置期間（「胸：3日前」など）を格納するステート
  const [partDaysAgo, setPartDaysAgo] = useState<
    { part: string; daysAgo: number }[]
  >([])
  // 今日のトレーニング実施内容（種目・重量・回数など）のリストを格納するステート
  const [todaySets, setTodaySets] = useState<Set[]>([])

  // 部位ごとの最終トレーニング日からの経過日数を取得
  useEffect(() => {
    /**
    * 非同期処理asyncでデータ取得
    * 過去の全記録から各部位の最終トレーニング日を特定し、
    * 今日までの経過日数を計算して画面を更新する
    */
    const fetchPartDaysAgo = async () => {
      // 1. Supabaseからデータを取ってくる
      // 種目マスタを取得
      const { data: exercisesData } = await supabase.from('exercises').select('*')
      // トレーニングデータを取得
      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })

      // 種目マスタかトレーニング記録のどちらか一方が取得できない場合は強制終了
      if (!exercisesData || !setsData) return

      // 2. 今日の日付文字列（YYYY-MM-DD形式など）を取得
      const todayStr = getTodayJST()

      // 3. 過去の全記録から各部位の最終トレーニング日を特定し、今日までの経過日数を計算してソートしたリストを返す
      const records = calculatePartDaysAgo(exercisesData, setsData, todayStr)

      // 4. 計算結果をステートに入れて画面を再描画
      setPartDaysAgo(records)
    }

    fetchPartDaysAgo()
  }, [])

  // 今日のトレーニングステータスがメイン・レストポーズである全種目の記録を取得
  useEffect(() => {
    /**
     * 今日実施したトレーニングセット（メイン・レストポーズ）を取得し、
     * 画面の「今日の記録」を更新する
     */
    const fetchTodaySets = async () => {
      // 今日の日付を取得
      const today = getTodayJST()

      const { data: setsData } = await supabase
        .from('sets')
        .select('*')
        .eq('date', today)
        .in('status', ['メイン', 'レストポーズ'])

      // 今日の記録が存在する場合、トレーニング実施内容（種目・重量・回数など）のリストを格納するステートを更新
      if (setsData){
        // [...setsData]はスプレッド構文と言うらしい元のデータを汚さずに編集をする為のコピーデータ
        // .sort((a, b) => a.exercise_order - b.exercise_order)で種目順を比較し、降順にしている
        const sortedSets = [...setsData].sort((a, b) => a.exercise_order - b.exercise_order)
        //ステート(setTodaySets)に今日のトレーニング種目をいれるため、画面に反映させる 
        setTodaySets(sortedSets)
      }
    }

    fetchTodaySets()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-8">
      {/* { 画面タイトル } */}
      <h1 className="text-2xl font-bold text-gray-800">🏋️ トレーニング記録</h1>

      {/* ｛ メインナビゲーショングリッドレイアウト ｝ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {/* { 各リンクボタン } */}
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
        <Link href="/chat" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
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
        {/* テーブルの大枠 */}
        <table className="min-w-full table-auto border border-gray-300 text-sm">
        {/* テーブルのカラム */}
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">部位</th>
              <th className="border px-3 py-2 text-right">経過日数</th>
            </tr>
          </thead>
          {/* テーブルの中身 */}
          <tbody>
            {/* もし部位ごとの放置期間のデータがあれば: map を使って、部位の数だけ行を表示
            もしデータが空なら: 「データがありません」という1行だけのメッセージを表示 */}
            {partDaysAgo.length > 0 ? (
              partDaysAgo.map(record => (
                <tr key={record.part} className="hover:bg-gray-50">
                  {/* 部位 */}
                  <td className="border px-3 py-2">{record.part}</td>
                  {/* 経過日数 */}
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
        {/* テーブルの大枠 */}
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          {/* テーブルのカラム */}
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">種目</th>
              <th className="border px-3 py-2 text-right">重量 (kg)</th>
              <th className="border px-3 py-2 text-right">セット番号</th>
              <th className="border px-3 py-2 text-right">レップ数</th>
            </tr>
          </thead>
          {/* テーブルの中身 */}
          <tbody>
            {/* ソートする為、スプレッド構文で展開 */}
            {[...todaySets]
              // mapで表示
              .map((set, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {/* 種目名 */}
                  <td className="border px-3 py-2">{set.exercise}</td>
                  {/* 重量 */}
                  <td className="border px-3 py-2 text-right">{set.weight}</td>
                  {/* セット番号 */}
                  <td className="border px-3 py-2 text-right">{set.set_number ?? '—'}</td>
                  {/* レップ数 */}
                  <td className="border px-3 py-2 text-right">{set.reps}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
