import type { WeightHistoryEntry } from '@/types/types'

/**
 * 体重履歴テーブルコンポーネント
 * 
 * 直近1ヶ月の体重記録を一覧表示します。
 * 日付、体重、前週比、先月比を表示し、差分は色分けされます。
 * - 増加: 赤色
 * - 減少: 青色
 * - 変化なし: 灰色
 */

type WeightHistoryTableProps = {
    /** 体重履歴データ */
    data: WeightHistoryEntry[]
}

/**
 * 差分を色付きでフォーマット
 * 
 * @param diff - 差分値（文字列）
 * @returns {JSX.Element} フォーマットされた差分表示
 */
const formatDiff = (diff: string | null) => {
    if (diff === null) return '—'

    const num = parseFloat(diff)
    const color =
        num > 0
            ? 'text-red-600'   // 増加は赤
            : num < 0
                ? 'text-blue-600' // 減少は青
                : 'text-gray-600' // 変化なしは灰色

    return (
        <span className={color}>
            {num > 0 ? '+' : ''}
            {diff} kg
        </span>
    )
}

export default function WeightHistoryTable({ data }: WeightHistoryTableProps) {
    if (data.length === 0) {
        return <p className="text-gray-500">まだ記録がありません</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">日付</th>
                        <th className="border px-4 py-2">体重 (kg)</th>
                        <th className="border px-4 py-2">前週比</th>
                        <th className="border px-4 py-2">先月比</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50">
                            <td className="border px-4 py-2">{entry.date}</td>
                            <td className="border px-4 py-2">{entry.weight}</td>
                            <td className="border px-4 py-2">
                                {formatDiff(entry.diffFromLastWeek)}
                            </td>
                            <td className="border px-4 py-2">
                                {formatDiff(entry.diffFromLastMonth)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
