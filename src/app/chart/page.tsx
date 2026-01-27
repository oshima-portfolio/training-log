'use client'
import VolumeChart from '@/components/VolumeChart'
import { useRouter } from 'next/navigation'
import { useChartData } from './hooks/useChartData'
import ChartFilter from './components/ChartFilter'

/**
 * グラフタイプに応じた日本語名を取得
 */
const getChartTypeName = (chartType: string): string => {
  switch (chartType) {
    case 'volume':
      return '総負荷量'
    case 'maxWeight':
      return '最大重量'
    case 'estimatedMax':
      return '推定1RM'
    case 'setCount':
      return 'セット数'
    default:
      return ''
  }
}

/**
 * 表示モードに応じた日本語名を取得
 */
const getModeName = (mode: string): string => {
  switch (mode) {
    case 'daily':
      return '日別'
    case 'weekly':
      return '週別'
    case 'monthly':
      return '月別'
    default:
      return ''
  }
}

export default function ChartPage() {
  const router = useRouter()
  const {
    exercises,
    categories,
    targetType,
    setTargetType,
    exercise,
    setExercise,
    bodyPart,
    setBodyPart,
    mode,
    setMode,
    chartType,
    setChartType,
    period,
    setPeriod,
    chartData,
    loading,
    error
  } = useChartData()

  if (loading && chartData.length === 0) {
    return <div className="p-6">読み込み中...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  // グラフタイトルを動的に生成
  const displayTarget = targetType === 'exercise' ? exercise : bodyPart
  const chartTitle = `${displayTarget}の${getModeName(mode)}${getChartTypeName(chartType)}`

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">📈 トレーニングデータ分析</h1>

      <ChartFilter
        exercises={exercises}
        categories={categories}
        targetType={targetType}
        setTargetType={setTargetType}
        exercise={exercise}
        setExercise={setExercise}
        bodyPart={bodyPart}
        setBodyPart={setBodyPart}
        chartType={chartType}
        setChartType={setChartType}
        period={period}
        setPeriod={setPeriod}
        mode={mode}
        setMode={setMode}
      />

      {chartData.length > 0 ? (
        <div className="bg-white border rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            {chartTitle}
          </h2>
          <VolumeChart data={chartData} chartType={chartType} />
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">選択した条件に該当する記録がまだありません</p>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        ← 戻る
      </button>
    </main>
  )
}
