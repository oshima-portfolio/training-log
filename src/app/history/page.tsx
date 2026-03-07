'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHistoryData } from './hooks/useHistoryData'
import HistoryFilter from './components/HistoryFilter'
import HistoryTable from './components/HistoryTable'
import type { WorkoutSet } from '@/types/types'
import { toJSTString } from '@/utils/date'

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
    handleFilter,
    deleteSet,
    updateSet
  } = useHistoryData()

  // Delete Handler
  const handleDeleteSet = async (id: string) => {
    await deleteSet(id)
  }

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null)
  const [editForm, setEditForm] = useState<Partial<WorkoutSet>>({})

  const handleEditClick = (set: WorkoutSet) => {
    setEditingSet(set)
    setEditForm({
      date: set.date,
      exercise: set.exercise,
      weight: set.weight,
      reps: set.reps,
      set_number: set.set_number,
      status: set.status,
      note: set.note || '',
      exercise_order: set.exercise_order
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSet) return

    try {
      await updateSet(editingSet.id, editForm)
      setIsEditModalOpen(false)
      setEditingSet(null)
    } catch (error) {
      alert('Failed to update set')
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800">📝 履歴表示</h1>

      <div>
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
      </div>

      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        戻る
      </button>

      {/* 履歴テーブル */}
      <HistoryTable
        sets={filteredSets}
        weights={weights}
        onDelete={handleDeleteSet}
        onEdit={handleEditClick}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">記録を編集</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">日付</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={editForm.date ? toJSTString(editForm.date) : ''}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">種目</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={editForm.exercise || ''}
                    onChange={e => setEditForm({ ...editForm, exercise: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {exercises.map(ex => (
                      <option key={ex.exercises_id} value={ex.name}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">重量 (kg)</label>
                    <select
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      value={editForm.weight || ''}
                      onChange={e => setEditForm({ ...editForm, weight: parseFloat(e.target.value) })}
                    >
                      <option value="">選択してください</option>
                      {Array.from({ length: 121 }, (_, i) => i * 2.5).map(n => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">回数</label>
                    <input
                      type="number"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      value={editForm.reps || ''}
                      onChange={e => setEditForm({ ...editForm, reps: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">セット数</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={editForm.set_number || ''}
                    onChange={e => setEditForm({ ...editForm, set_number: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ステータス</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={editForm.status || ''}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="">選択してください</option>
                    {statuses.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">備考</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={editForm.note || ''}
                    onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    更新
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
