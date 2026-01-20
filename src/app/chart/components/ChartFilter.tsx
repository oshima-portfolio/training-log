import type { ChartMode } from '../hooks/useChartData'

type Props = {
    exercise: string
    setExercise: (value: string) => void
    mode: ChartMode
    setMode: (value: ChartMode) => void
}

export default function ChartFilter({ exercise, setExercise, mode, setMode }: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">種目を選択</label>
                <select
                    value={exercise}
                    onChange={e => setExercise(e.target.value)}
                    className="border p-2 rounded w-full max-w-xs"
                >
                    {['ベンチプレス', 'スクワット', 'デッドリフト'].map(name => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">表示モード</label>
                <select
                    value={mode}
                    onChange={e => setMode(e.target.value as ChartMode)}
                    className="border p-2 rounded w-full max-w-xs"
                >
                    <option value="daily">日別</option>
                    <option value="weekly">週別</option>
                    <option value="monthly">月別</option>
                </select>
            </div>
        </div>
    )
}
