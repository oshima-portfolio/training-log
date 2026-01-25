import type { ChartMode, ChartType, PeriodFilter, Exercise } from '@/types/types'

type Props = {
    exercises: Exercise[]
    exercise: string
    setExercise: (value: string) => void
    chartType: ChartType
    setChartType: (value: ChartType) => void
    period: PeriodFilter
    setPeriod: (value: PeriodFilter) => void
    mode: ChartMode
    setMode: (value: ChartMode) => void
}

export default function ChartFilter({
    exercises,
    exercise,
    setExercise,
    chartType,
    setChartType,
    period,
    setPeriod,
    mode,
    setMode
}: Props) {
    return (
        <div className="bg-white border rounded-lg shadow p-4 space-y-4">
            {/* 種目選択 */}
            <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                    📋 種目を選択
                </label>
                <select
                    value={exercise}
                    onChange={e => setExercise(e.target.value)}
                    className="border border-gray-300 p-3 rounded-lg w-full text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {exercises.map(ex => (
                        <option key={ex.exercises_id} value={ex.name}>
                            {ex.name} ({ex.category})
                        </option>
                    ))}
                </select>
            </div>

            {/* グラフタイプ選択 */}
            <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                    📊 グラフタイプ
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setChartType('volume')}
                        className={`p-3 rounded-lg font-medium transition ${chartType === 'volume'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        総負荷量
                    </button>
                    <button
                        onClick={() => setChartType('maxWeight')}
                        className={`p-3 rounded-lg font-medium transition ${chartType === 'maxWeight'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        最大重量
                    </button>
                    <button
                        onClick={() => setChartType('estimatedMax')}
                        className={`p-3 rounded-lg font-medium transition ${chartType === 'estimatedMax'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        推定1RM
                    </button>
                    <button
                        onClick={() => setChartType('setCount')}
                        className={`p-3 rounded-lg font-medium transition ${chartType === 'setCount'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        セット数
                    </button>
                </div>
            </div>

            {/* 期間フィルター選択 */}
            <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                    📅 表示期間
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setPeriod('all')}
                        className={`p-3 rounded-lg font-medium transition ${period === 'all'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        全期間
                    </button>
                    <button
                        onClick={() => setPeriod('3months')}
                        className={`p-3 rounded-lg font-medium transition ${period === '3months'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        直近3ヶ月
                    </button>
                    <button
                        onClick={() => setPeriod('6months')}
                        className={`p-3 rounded-lg font-medium transition ${period === '6months'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        直近6ヶ月
                    </button>
                    <button
                        onClick={() => setPeriod('1year')}
                        className={`p-3 rounded-lg font-medium transition ${period === '1year'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        直近1年
                    </button>
                </div>
            </div>

            {/* 表示モード選択 */}
            <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">
                    🔄 集計単位
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setMode('daily')}
                        className={`p-3 rounded-lg font-medium transition ${mode === 'daily'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        日別
                    </button>
                    <button
                        onClick={() => setMode('weekly')}
                        className={`p-3 rounded-lg font-medium transition ${mode === 'weekly'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        週別
                    </button>
                    <button
                        onClick={() => setMode('monthly')}
                        className={`p-3 rounded-lg font-medium transition ${mode === 'monthly'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        月別
                    </button>
                </div>
            </div>
        </div>
    )
}
