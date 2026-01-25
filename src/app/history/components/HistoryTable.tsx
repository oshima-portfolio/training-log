import type { WorkoutSet } from '@/types/types'

/**
 * 履歴テーブルコンポーネント
 * 
 * トレーニングセットの履歴を一覧表示します。
 * 日付、体重、種目、ステータス、セット数、重量、回数、備考を表示します。
 */

type HistoryTableProps = {
    /** 表示するトレーニングセットデータ */
    sets: WorkoutSet[]
    /** 日付ごとの体重マップ */
    weights: Record<string, number>
}

export default function HistoryTable({ sets, weights }: HistoryTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 text-sm mt-4">
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="border px-3 py-2 whitespace-nowrap">日付</th>
                        <th className="border px-3 py-2 whitespace-nowrap">順序</th>
                        <th className="border px-3 py-2 whitespace-nowrap">体重</th>
                        <th className="border px-3 py-2 whitespace-nowrap">種目</th>
                        <th className="border px-3 py-2 whitespace-nowrap">ステータス</th>
                        <th className="border px-3 py-2 whitespace-nowrap">セット</th>
                        <th className="border px-3 py-2 whitespace-nowrap">重量</th>
                        <th className="border px-3 py-2 whitespace-nowrap">回数</th>
                        <th className="border px-3 py-2 whitespace-nowrap">備考</th>
                    </tr>
                </thead>
                <tbody>
                    {sets.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="text-center py-4 text-gray-500">
                                条件に一致するデータがありません
                            </td>
                        </tr>
                    ) : (
                        sets.map(set => {
                            const date = new Date(set.date).toISOString().split('T')[0]
                            const weight = weights[date]
                            return (
                                <tr key={set.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2">{date}</td>
                                    <td className="border px-3 py-2 text-center">{set.exercise_order}</td>
                                    <td className="border px-3 py-2 text-center">{weight ?? '-'}</td>
                                    <td className="border px-3 py-2">{set.exercise}</td>
                                    <td className="border px-3 py-2 text-center">{set.status}</td>
                                    <td className="border px-3 py-2 text-center">{set.set_number ?? '-'}</td>
                                    <td className="border px-3 py-2 text-center">{set.weight}</td>
                                    <td className="border px-3 py-2 text-center">{set.reps}</td>
                                    <td className="border px-3 py-2 max-w-xs break-words">{set.note || '-'}</td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}
