import React, { useState } from 'react'
import { DropsetRoutine } from '@/types/types'
import { getTodayJST } from '@/utils/date'

interface ExerciseItemProps {
  routine: DropsetRoutine
  onSave: (routine: DropsetRoutine, reps: number, note: string) => Promise<{ success: boolean; message: string | null; error?: string }>
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({ routine, onSave }) => {
  const [reps, setReps] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const today = getTodayJST()
  const isCompletedToday = routine.is_completed === today

  const handleSave = async () => {
    const repsNum = parseInt(reps)
    if (isNaN(repsNum)) {
      alert('有効なレップ数を入力してください')
      return
    }

    setIsSaving(true)
    const result = await onSave(routine, repsNum, note)
    setIsSaving(false)

    if (result.success) {
      if (result.message) {
        alert(result.message)
      }
      setReps('')
      setNote('')
    } else {
      alert('保存に失敗しました: ' + result.error)
    }
  }

  return (
    <div className={`p-4 border rounded-lg shadow-sm space-y-3 ${isCompletedToday ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-lg text-gray-800">{routine.exercise}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-sm ${
            isCompletedToday 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {isCompletedToday ? '済' : '未'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            目標: {routine.weight}kg × {routine.threshold_reps}回
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
        <div>成功: {routine.consecutive_success}/2</div>
        <div>失敗: {routine.consecutive_failure}/2</div>
        <div>降格しきい値: {routine.demotion_threshold}回</div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            className="flex-1 border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          >
            <option value="" disabled>レップ数</option>
            {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num} 回</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSaving ? '保存中...' : '記録'}
          </button>
        </div>
        <input
          type="text"
          placeholder="備考 (任意)"
          className="w-full border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  )
}
