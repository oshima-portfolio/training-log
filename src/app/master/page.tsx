'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/Modal'
import type { Exercise, Status } from '@/types/types'

export default function MasterPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const router = useRouter()

  // Exercise Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [exerciseForm, setExerciseForm] = useState<{ exercises_id: string | number; name: string; category: string }>({ exercises_id: '', name: '', category: '' })

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<Status | null>(null)
  const [statusForm, setStatusForm] = useState({ id: '', name: '' })

  const fetchMasters = async () => {
    const { data: ex } = await supabase.from('exercises').select('*').order('exercises_id', { ascending: true })
    const { data: st } = await supabase.from('statuses').select('*').order('id', { ascending: true }) // assuming 'id' based on types.ts, will verify if error occurs
    setExercises(ex ?? [])
    setStatuses(st ?? [])
  }

  useEffect(() => {
    fetchMasters()
  }, [])

  // Exercise Handlers
  const openAddExerciseModal = () => {
    setEditingExercise(null)
    setExerciseForm({ exercises_id: '', name: '', category: '' })
    setIsExerciseModalOpen(true)
  }

  const openEditExerciseModal = (ex: Exercise) => {
    setEditingExercise(ex)
    setExerciseForm({ exercises_id: ex.exercises_id, name: ex.name, category: ex.category })
    setIsExerciseModalOpen(true)
  }

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentExercisesId = Number(exerciseForm.exercises_id);
    if (editingExercise) {
      // Update
      const { error } = await supabase
        .from('exercises')
        .update({ exercises_id: currentExercisesId, name: exerciseForm.name, category: exerciseForm.category })
        .eq('exercises_id', editingExercise.exercises_id)

      if (!error) {
        setIsExerciseModalOpen(false)
        fetchMasters()
      } else {
        alert('Failed to update exercise')
      }
    } else {
      // Add
      const { error } = await supabase
        .from('exercises')
        .insert([{ exercises_id: currentExercisesId, name: exerciseForm.name, category: exerciseForm.category }])

      if (!error) {
        setIsExerciseModalOpen(false)
        fetchMasters()
      } else {
        alert('Failed to add exercise')
      }
    }
  }

  const handleDeleteExercise = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('exercises_id', id)

    if (!error) {
      fetchMasters()
    } else {
      alert('Failed to delete exercise')
    }
  }

  // Status Handlers
  const openAddStatusModal = () => {
    setEditingStatus(null)
    setStatusForm({ id: '', name: '' })
    setIsStatusModalOpen(true)
  }

  const openEditStatusModal = (st: Status) => {
    setEditingStatus(st)
    setStatusForm({ id: st.id, name: st.name })
    setIsStatusModalOpen(true)
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingStatus) {
      // Update
      const { error } = await supabase
        .from('statuses')
        .update({ id: statusForm.id, name: statusForm.name })
        .eq('id', editingStatus.id) // Assuming 'id' is correct for statuses

      if (!error) {
        setIsStatusModalOpen(false)
        fetchMasters()
      } else {
        alert('Failed to update status')
      }
    } else {
      // Add
      const { error } = await supabase
        .from('statuses')
        .insert([{ id: statusForm.id, name: statusForm.name }])

      if (!error) {
        setIsStatusModalOpen(false)
        fetchMasters()
      } else {
        alert('Failed to add status')
      }
    }
  }

  const handleDeleteStatus = async (id: string) => {
    if (!confirm('Are you sure you want to delete this status?')) return

    const { error } = await supabase
      .from('statuses')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchMasters()
    } else {
      alert('Failed to delete status')
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🛠️ マスタ管理</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          戻る
        </button>
      </div>

      {/* 種目一覧 */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">🏋️‍♂️ 種目一覧</h2>
          <button
            onClick={openAddExerciseModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>+</span> 追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種目名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exercises.map(ex => (
                <tr key={ex.exercises_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ex.exercises_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ex.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ex.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditExerciseModal(ex)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(ex.exercises_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ステータス一覧 */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">📌 ステータス一覧</h2>
          <button
            onClick={openAddStatusModal}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>+</span> 追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス名</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statuses.map(st => (
                <tr key={st.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{st.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{st.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditStatusModal(st)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteStatus(st.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Exercise Modal */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        title={editingExercise ? '種目を編集' : '新しい種目'}
      >
        <form onSubmit={handleExerciseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">種目ID (exercises_id)</label>
            <input
              type="number"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={exerciseForm.exercises_id}
              onChange={e => setExerciseForm({ ...exerciseForm, exercises_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">種目名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={exerciseForm.name}
              onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={exerciseForm.category}
              onChange={e => setExerciseForm({ ...exerciseForm, category: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsExerciseModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingExercise ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={editingStatus ? 'ステータスを編集' : '新しいステータス'}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ステータスID (id)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={statusForm.id}
              onChange={e => setStatusForm({ ...statusForm, id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ステータス名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={statusForm.name}
              onChange={e => setStatusForm({ ...statusForm, name: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {editingStatus ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}
