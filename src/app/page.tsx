'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📋 トレーニングログメニュー</h1>
      <ul className="space-y-2 text-lg">
        <li><Link href="/workout">💪 筋トレ記録</Link></li>
        <li><Link href="/weight">⚖️ 体重記録</Link></li>
        <li><Link href="/history">📈 履歴表示・分析</Link></li>
        <li><Link href="/csv">🗂️ CSV出力</Link></li>
        <li><Link href="/master">🛠️ マスタ管理</Link></li>
      </ul>
    </main>
  )
}
