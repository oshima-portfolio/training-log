import type { WorkoutSet } from '@/types/types'

/**
 * 選択種目の履歴テーブルコンポーネント
 * 
 * 選択した種目の全記録を新しい順に表示します。
 * 日付、ステータス、セット数、重量、レップ数を一覧表示します。
 */

type ExerciseHistoryTableProps = {
    /** 選択中の種目名 */
    selectedExercise: string
    /** 種目の履歴データ */
    history: WorkoutSet[]
}

export default function ExerciseHistoryTable({
    selectedExercise,
    history
}: ExerciseHistoryTableProps) {
    return (
        <div className="bg-white border rounded-lg shadow p-4 w-full mt-6">
            <h2 className="text-lg font-semibold mb-4">
                📌 {selectedExercise ? `${selectedExercise} の全記録` : '選択種目の全記録'}
            </h2>

            {history.length > 0 && (
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2 text-left">日付</th>
                            <th className="border px-3 py-2 text-right">ステータス</th>
                            <th className="border px-3 py-2 text-right">セット数</th>
                            <th className="border px-3 py-2 text-right">重量</th>
                            <th className="border px-3 py-2 text-right">レップ数</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((set, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border px-3 py-2">{set.date}</td>
                                <td className="border px-3 py-2 text-right">{set.status}</td>
                                <td className="border px-3 py-2 text-right">{set.set_number}</td>
                                <td className="border px-3 py-2 text-right">{set.weight}</td>
                                <td className="border px-3 py-2 text-right">{set.reps}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
