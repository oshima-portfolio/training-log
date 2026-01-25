import type { Exercise, Status } from '@/types/types'

/**
 * ワークアウトフォーム入力コンポーネント
 * 
 * トレーニング記録の入力フォーム部分。
 * 種目、ステータス、重量、回数、セット番号、備考、種目順序の入力UIを提供します。
 */

type WorkoutFormInputsProps = {
    /** 種目マスタデータ */
    exercises: Exercise[]
    /** ステータスマスタデータ */
    statuses: Status[]
    /** 選択中の種目 */
    exercise: string
    /** 種目変更ハンドラ */
    onExerciseChange: (value: string) => void
    /** 選択中のステータス */
    status: string
    /** ステータス変更ハンドラ */
    onStatusChange: (value: string) => void
    /** 重量（kg） */
    weight: string
    /** 重量変更ハンドラ */
    onWeightChange: (value: string) => void
    /** 回数（rep） */
    reps: string
    /** 回数変更ハンドラ */
    onRepsChange: (value: string) => void
    /** セット番号 */
    setNumber: string
    /** セット番号変更ハンドラ */
    onSetNumberChange: (value: string) => void
    /** 備考 */
    note: string
    /** 備考変更ハンドラ */
    onNoteChange: (value: string) => void
    /** 種目順序 */
    exerciseOrder: string
    /** 種目順序変更ハンドラ */
    onExerciseOrderChange: (value: string) => void
    /** 選択種目変更ハンドラ（履歴表示用） */
    onSelectedExerciseChange: (value: string) => void
}

export default function WorkoutFormInputs({
    exercises,
    statuses,
    exercise,
    onExerciseChange,
    status,
    onStatusChange,
    weight,
    onWeightChange,
    reps,
    onRepsChange,
    setNumber,
    onSetNumberChange,
    note,
    onNoteChange,
    exerciseOrder,
    onExerciseOrderChange,
    onSelectedExerciseChange
}: WorkoutFormInputsProps) {
    return (
        <div className="space-y-4">
            {/* 種目選択 */}
            <div>
                <label className="block font-medium mb-1">
                    種目 <span className="text-red-500">*</span>
                </label>
                <select
                    value={exercise}
                    onChange={e => {
                        const value = e.target.value
                        onExerciseChange(value)
                        onSelectedExerciseChange(value)
                    }}
                    className="w-full border p-2 rounded"
                >
                    <option value="">選択してください</option>
                    {exercises.map(e => (
                        <option key={e.exercises_id} value={e.name}>
                            【{e.category}】 {e.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ステータス選択 */}
            <div>
                <label className="block font-medium mb-1">
                    ステータス <span className="text-red-500">*</span>
                </label>
                <select
                    value={status}
                    onChange={e => onStatusChange(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">選択してください</option>
                    {statuses.map(s => (
                        <option key={s.id} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* セット番号（メインの場合のみ表示） */}
            {status === 'メイン' && (
                <div>
                    <label className="block font-medium mb-1">
                        セット番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={setNumber}
                        onChange={e => onSetNumberChange(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
            )}

            {/* 重量入力 */}
            <div>
                <label className="block font-medium mb-1">
                    重量 (kg) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                    {/* 整数部分のセレクトボックス */}
                    <select
                        value={Math.floor(Number(weight) || 0)}
                        onChange={e => {
                            const intVal = e.target.value
                            const decVal = (Number(weight) % 1).toFixed(1).split('.')[1] || '0'
                            onWeightChange(`${intVal}.${decVal}`)
                        }}
                        className="flex-1 border p-2 rounded bg-white"
                    >
                        <option value="">（kg）</option>
                        {Array.from({ length: 301 }, (_, i) => i).map(n => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>

                    <span className="text-xl font-bold">.</span>

                    {/* 小数部分のセレクトボックス */}
                    <select
                        value={(Number(weight) % 1).toFixed(1).split('.')[1] || '0'}
                        onChange={e => {
                            const intVal = Math.floor(Number(weight) || 0)
                            const decVal = e.target.value
                            onWeightChange(`${intVal}.${decVal}`)
                        }}
                        className="w-24 border p-2 rounded bg-white"
                    >
                        {Array.from({ length: 10 }, (_, i) => i).map(n => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>

                    <span className="ml-1 text-gray-600">kg</span>
                </div>
            </div>

            {/* 回数入力 */}
            <div>
                <label className="block font-medium mb-1">
                    回数 (rep) <span className="text-red-500">*</span>
                </label>
                <select
                    value={reps}
                    onChange={e => onRepsChange(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">選択してください</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
            </div>

            {/* 備考 */}
            <div>
                <label className="block font-medium mb-1">備考（任意）</label>
                <textarea
                    value={note}
                    onChange={e => onNoteChange(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>

            {/* 種目順序 */}
            <div>
                <label className="block font-medium mb-1">
                    種目順序 <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    value={exerciseOrder}
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100"
                />
            </div>
        </div>
    )
}
