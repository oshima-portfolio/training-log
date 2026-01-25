import type { MonthlyAverage } from '@/types/types'

/**
 * 月別平均体重テーブルコンポーネント
 * 
 * 月ごとの平均体重を一覧表示します。
 * YYYY-MM形式の年月と平均体重（kg）を表示します。
 */

type MonthlyAverageTableProps = {
    /** 月別平均データ */
    data: MonthlyAverage[]
}

export default function MonthlyAverageTable({ data }: MonthlyAverageTableProps) {
    if (data.length === 0) {
        return <p className="text-gray-500">データがありません</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
                <thead className="bg-blue-50">
                    <tr>
                        <th className="border px-4 py-2">年月</th>
                        <th className="border px-4 py-2">平均体重 (kg)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, index) => (
                        <tr key={index} className="even:bg-gray-50">
                            <td className="border px-4 py-2">{entry.month}</td>
                            <td className="border px-4 py-2">{entry.average}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
