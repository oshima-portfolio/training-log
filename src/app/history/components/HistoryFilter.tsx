import type { Exercise } from '@/types/types'

/**
 * 履歴フィルターコンポーネント
 * 
 * 種目、ステータス、期間でトレーニング履歴を絞り込むためのフィルターUI。
 */

type HistoryFilterProps = {
    /** 種目フィルター値 */
    filterExercise: string
    /** 種目フィルター変更ハンドラ */
    onExerciseChange: (value: string) => void
    /** ステータスフィルター値 */
    filterStatus: string
    /** ステータスフィルター変更ハンドラ */
    onStatusChange: (value: string) => void
    /** 開始日フィルター値 */
    filterStartDate: string
    /** 開始日フィルター変更ハンドラ */
    onStartDateChange: (value: string) => void
    /** 終了日フィルター値 */
    filterEndDate: string
    /** 終了日フィルター変更ハンドラ */
    onEndDateChange: (value: string) => void
    /** 種目マスタデータ */
    exercises: Exercise[]
    /** ステータスマスタデータ */
    statuses: string[]
    /** フィルター実行ハンドラ */
    onFilter: () => void
}

export default function HistoryFilter({
    filterExercise,
    onExerciseChange,
    filterStatus,
    onStatusChange,
    filterStartDate,
    onStartDateChange,
    filterEndDate,
    onEndDateChange,
    exercises,
    statuses,
    onFilter
}: HistoryFilterProps) {
    return (
        <>
            {/* 検索フォーム */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 種目フィルター */}
                <div>
                    <label className="block text-sm font-medium">種目</label>
                    <select
                        value={filterExercise}
                        onChange={e => onExerciseChange(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">すべて</option>
                        {exercises.map(ex => (
                            <option key={ex.exercises_id} value={ex.name}>
                                【{ex.category}】 {ex.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ステータスフィルター */}
                <div>
                    <label className="block text-sm font-medium">ステータス</label>
                    <select
                        value={filterStatus}
                        onChange={e => onStatusChange(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">すべて</option>
                        {statuses.map(name => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 開始日フィルター */}
                <div>
                    <label className="block text-sm font-medium">開始日</label>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={e => onStartDateChange(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* 終了日フィルター */}
                <div>
                    <label className="block text-sm font-medium">終了日</label>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={e => onEndDateChange(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            {/* 絞り込みボタン */}
            <button
                onClick={onFilter}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                絞り込む
            </button>
        </>
    )
}
