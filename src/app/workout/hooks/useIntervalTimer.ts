import { useState, useEffect } from 'react'

/**
 * インターバルタイマーの状態管理フック
 * 
 * トレーニングのセット間インターバルを計測するためのカスタムフック。
 * タイマーの基本時間設定、残り時間、開始/停止/リセット機能を提供します。
 * タイマーが0になった際にバイブレーションと音声通知を実行します。
 * 
 * @returns {Object} タイマー関連の状態と操作関数
 * @property {number} timer - タイマーの基本設定時間（秒）
 * @property {number} remaining - タイマーの残り時間（秒）
 * @property {boolean} isRunning - タイマーが動作中かどうか
 * @property {Function} startTimer - タイマーを開始する関数
 * @property {Function} stopTimer - タイマーを停止する関数
 * @property {Function} resetTimer - タイマーをリセットする関数
 * @property {Function} setPreset - プリセット時間を設定する関数
 */
export const useIntervalTimer = () => {
    // タイマーの基本設定時間（デフォルト120秒 = 2分）
    const [timer, setTimer] = useState(120)
    // タイマーの残り時間
    const [remaining, setRemaining] = useState(120)
    // タイマーが動作中かどうか
    const [isRunning, setIsRunning] = useState(false)
    // setIntervalのIDを保持（クリーンアップ用）
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

    /**
     * バイブレーションと音声通知を発火する
     * タイマーが0になった際に呼び出されます
     */
    const triggerVibration = () => {
        // クライアントサイドでのみ実行
        if (typeof window !== 'undefined') {
            // バイブレーション（対応デバイスのみ）
            // パターン: 500ms振動 → 300ms休止 → 500ms振動
            if ('vibrate' in navigator) {
                navigator.vibrate([500, 300, 500])
            }

            // 音声通知を再生
            const audio = new Audio('/sound/Cell_Phone.mp3')
            audio.play().catch(err => {
                console.error('音声再生エラー:', err)
            })
        }
    }

    /**
     * タイマーを開始する
     * 既に動作中の場合は何もしません
     */
    const startTimer = () => {
        // 既に動作中の場合は何もしない
        if (isRunning) return

        setIsRunning(true)
        // 1秒ごとに残り時間を減らす
        const id = setInterval(() => {
            setRemaining(prev => {
                // 残り時間が1秒以下になったら
                if (prev <= 1) {
                    clearInterval(id)
                    setIsRunning(false)
                    triggerVibration() // 通知を発火
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        setIntervalId(id)
    }

    /**
     * タイマーを停止する
     */
    const stopTimer = () => {
        if (intervalId) clearInterval(intervalId)
        setIsRunning(false)
    }

    /**
     * タイマーをリセットする
     * 停止してから、残り時間を基本設定時間に戻します
     */
    const resetTimer = () => {
        stopTimer()
        setRemaining(timer)
    }

    /**
     * プリセット時間を設定する
     * タイマーを停止し、新しい基本時間と残り時間を設定します
     * 
     * @param {number} seconds - 設定する時間（秒）
     */
    const setPreset = (seconds: number) => {
        stopTimer()
        setTimer(seconds)
        setRemaining(seconds)
    }

    // コンポーネントのアンマウント時にタイマーをクリーンアップ
    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [intervalId])

    return {
        timer,
        remaining,
        isRunning,
        startTimer,
        stopTimer,
        resetTimer,
        setPreset
    }
}
