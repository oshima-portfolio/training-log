/**
 * インターバルタイマーコンポーネント
 * 
 * トレーニングのセット間インターバルを計測・表示するUIコンポーネント。
 * プリセットボタンでよく使う時間を素早く設定でき、
 * スタート/ストップ/リセットボタンでタイマーを操作できます。
 */

type IntervalTimerProps = {
    /** 残り時間（秒） */
    remaining: number
    /** タイマーが動作中かどうか */
    isRunning: boolean
    /** タイマーを開始する関数 */
    onStart: () => void
    /** タイマーを停止する関数 */
    onStop: () => void
    /** タイマーをリセットする関数 */
    onReset: () => void
    /** プリセット時間を設定する関数 */
    onSetPreset: (seconds: number) => void
}

export default function IntervalTimer({
    remaining,
    isRunning,
    onStart,
    onStop,
    onReset,
    onSetPreset
}: IntervalTimerProps) {
    // 残り時間を分:秒形式にフォーマット
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    return (
        <div className="bg-gray-100 p-4 rounded shadow space-y-2 mt-6">
            <h2 className="text-lg font-semibold text-gray-700">⏱️ インターバル</h2>

            {/* 残り時間表示 */}
            <p className="text-2xl font-mono text-center">
                {minutes}:{String(seconds).padStart(2, '0')}
            </p>

            {/* プリセットボタン */}
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => onSetPreset(120)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    2分
                </button>
                <button
                    onClick={() => onSetPreset(180)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    3分
                </button>
                <button
                    onClick={() => onSetPreset(300)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    5分
                </button>
                <button
                    onClick={() => onSetPreset(5)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    テスト用
                </button>
            </div>

            {/* コントロールボタン */}
            <div className="flex justify-center gap-2 mt-2">
                <button
                    onClick={onStart}
                    className="bg-green-500 text-white px-4 py-1 rounded"
                >
                    スタート
                </button>
                <button
                    onClick={onStop}
                    className="bg-yellow-500 text-white px-4 py-1 rounded"
                >
                    ストップ
                </button>
                <button
                    onClick={onReset}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                >
                    リセット
                </button>
            </div>
        </div>
    )
}
