'use client'
import VolumeChart from '@/components/VolumeChart'
import { useRouter } from 'next/navigation'
import { useChartData } from './hooks/useChartData'
import ChartFilter from './components/ChartFilter'

export default function ChartPage() {
  const router = useRouter()
  const { exercise, setExercise, mode, setMode, volumeData, loading, error } = useChartData()

  if (loading && volumeData.length === 0) {
    return <div className="p-6">読み込み中...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📈 総負荷量グラフ</h1>

      <ChartFilter
        exercise={exercise}
        setExercise={setExercise}
        mode={mode}
        setMode={setMode}
      />

      {volumeData.length > 0 ? (
        <div className="bg-white border rounded-lg shadow p-4 w-full max-w-4xl">
          <VolumeChart
            data={volumeData}
            title={`${exercise}の${mode === 'daily' ? '日別' : mode === 'weekly' ? '週別' : '月別'}総負荷量`}
          />
        </div>
      ) : (
        <p className="text-gray-500 mt-4">記録がまだありません</p>
      )}

      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>
    </main>
  )
}
