'use client'
import { useRouter } from 'next/navigation'
import { useCSVData } from './hooks/useCSVData'
import { generateTrainingCSV, downloadCSV } from './utils/csvExport'

/**
 * CSV出力ページ
 * 
 * トレーニング履歴をCSV形式でダウンロードできます。
 * 日付、体重、種目、セット数、重量、回数、ステータス、備考、順序を含みます。
 */
export default function CsvPage() {
  const router = useRouter()
  const { sets, weightsMap } = useCSVData()

  /**
   * CSVダウンロードハンドラ
   * データをCSV形式に変換してダウンロードします
   */
  const handleDownload = () => {
    const csvContent = generateTrainingCSV(sets, weightsMap)
    downloadCSV(csvContent, 'training_log')
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">🗂️ CSV出力</h1>

      <div className="flex flex-col items-start space-y-2 mt-2">
        {/* ダウンロードボタン */}
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          📥 ダウンロード
        </button>

        {/* 戻るボタン */}
        <button
          onClick={() => router.back()}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          戻る
        </button>
      </div>
    </main>
  )
}
