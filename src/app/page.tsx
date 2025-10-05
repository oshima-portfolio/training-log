/*Reactコンポーネント*/
'use client'
/*Next.jsのLinkコンポーネントをインポート、ページ遷移を高速化するらしい*/
import Link from 'next/link'

/*Reactコンポーネント*/
export default function Home() {
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
        hover:bg-xxx-50:ホバー時の背景色変化（赤・青・緑など）
        transition:ホバー時のアニメーション効果
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <Link href="/workout" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-red-50 transition">
          💪 筋トレ記録
        </Link>
        <Link href="/weight" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-blue-50 transition">
          ⚖️ 体重記録
        </Link>
        <Link href="/history" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-green-50 transition">
          📝 履歴表示
        </Link>
        <Link href="/csv" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-yellow-50 transition">
          🗂️ CSV出力※未実装
        </Link>
        <Link href="/master" className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center hover:bg-gray-100 transition">
          🛠️ マスタ管理
        </Link>
      </div>
    </main>
  )
}
