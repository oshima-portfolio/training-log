'use client'
import { useRouter } from 'next/navigation'
import { useHistoryData } from './hooks/useHistoryData'
import HistoryFilter from './components/HistoryFilter'
import HistoryTable from './components/HistoryTable'

/**
 * トレーニング履歴表示ページ
 * 
 * 過去のトレーニング記録を一覧表示し、フィルター機能を提供します。
 * 種目、ステータス、期間で絞り込むことができます。
 */
export default function HistoryPage() {
  const router = useRouter()

  // 履歴データとフィルター状態を取得
  const {
    filteredSets,
    weights,
    exercises,
    statuses,
    filterExercise,
    setFilterExercise,
    filterStatus,
    setFilterStatus,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    handleFilter
  } = useHistoryData()

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">📝 履歴表示</h1>

      {/* フィルター */}
      <HistoryFilter
        filterExercise={filterExercise}
        onExerciseChange={setFilterExercise}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterStartDate={filterStartDate}
        onStartDateChange={setFilterStartDate}
        filterEndDate={filterEndDate}
        onEndDateChange={setFilterEndDate}
        exercises={exercises}
        statuses={statuses}
        onFilter={handleFilter}
      />

      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>

      {/* 履歴テーブル */}
      <HistoryTable sets={filteredSets} weights={weights} />
    </main>
  )
}
