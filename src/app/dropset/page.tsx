'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useDropsetWorkout } from './hooks/useDropsetWorkout'
import { RoutineList } from './components/RoutineList'
import { DropsetRoutine } from '@/types/types'

export default function DropsetPage() {
  const { routines, loading, error, saveSet } = useDropsetWorkout()
  const [selectedRoutineName, setSelectedRoutineName] = React.useState<string>('')
  const router = useRouter()

  // ユニークなルーチン名を取得
  const routineNames = React.useMemo(() => {
    const names = Array.from(new Set(routines.map(r => r.routine_name)))
    return names.sort()
  }, [routines])

  // 初期読み込み時に最初のルーチン名を選択
  React.useEffect(() => {
    if (routineNames.length > 0 && !selectedRoutineName) {
      setSelectedRoutineName(routineNames[0])
    }
  }, [routineNames, selectedRoutineName])

  const handleSaveSet = async (routine: DropsetRoutine, reps: number, note: string): Promise<{ success: boolean; message: string | null; error?: string }> => {
    const result = await saveSet(routine, reps, note)
    return {
      success: result.success,
      message: result.message ?? null,
      error: result.error
    }
  }

  if (loading) return <div className="text-center p-10">読み込み中...</div>
  if (error) return <div className="text-center text-red-500 p-10">エラー: {error}</div>

  const filteredRoutines = routines.filter(r => r.routine_name === selectedRoutineName)

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">🔥 短時間用筋トレ記録</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          戻る
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-4">
        <label htmlFor="routine-select" className="font-bold text-gray-700 whitespace-nowrap">
          ルーチンを選択:
        </label>
        <select
          id="routine-select"
          className="flex-1 border rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedRoutineName}
          onChange={(e) => setSelectedRoutineName(e.target.value)}
        >
          {routineNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <p className="text-gray-600">
        テンプレートに基づいて記録を行います。レップ数に応じて重量が自動調整されます。
      </p>

      {filteredRoutines.length > 0 ? (
        <RoutineList routines={filteredRoutines} onSave={handleSaveSet} />
      ) : (
        <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-lg">
          ルーチンを選択してください
        </div>
      )}
    </main>
  )
}
