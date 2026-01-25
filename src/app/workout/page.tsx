'use client'
import { useRouter } from 'next/navigation'
import { useWorkoutForm } from './hooks/useWorkoutForm'
import { useIntervalTimer } from './hooks/useIntervalTimer'
import IntervalTimer from './components/IntervalTimer'
import WorkoutFormInputs from './components/WorkoutFormInputs'
import ExerciseHistoryTable from './components/ExerciseHistoryTable'
import { validateWorkoutForm, submitWorkoutData } from './utils/workoutHelpers'

/**
 * ワークアウト記録ページ
 * 
 * トレーニングの記録を入力・保存するページです。
 * 以下の機能を提供します：
 * - 種目、ステータス、重量、回数などの入力
 * - インターバルタイマー（セット間の休憩時間計測）
 * - 選択種目の履歴表示
 * - メインセットの自動値設定（前回重量、セット番号）
 */
export default function WorkoutForm() {
  const router = useRouter()

  // フォーム状態管理
  const {
    today,
    exercises,
    statuses,
    exercise,
    setExercise,
    status,
    setStatus,
    weight,
    setWeight,
    reps,
    setReps,
    note,
    setNote,
    setNumber,
    setSetNumber,
    exerciseOrder,
    setExerciseOrder,
    selectedExercise,
    setSelectedExercise,
    exerciseHistory
  } = useWorkoutForm()

  // インターバルタイマー
  const {
    remaining,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setPreset
  } = useIntervalTimer()

  /**
   * フォーム送信ハンドラ
   * バリデーション → データ保存 → フォームリセット → タイマー再開
   */
  const handleSubmit = async () => {
    // バリデーション
    if (!validateWorkoutForm(exercise, status, weight, reps, exerciseOrder, setNumber)) {
      alert('⚠️ 必須項目が未入力です。すべて入力してください。')
      return
    }

    // データ送信
    const result = await submitWorkoutData(
      today,
      exercise,
      status,
      weight,
      reps,
      note,
      setNumber,
      exerciseOrder
    )

    if (!result.success) {
      alert('登録失敗: ' + result.error)
      return
    }

    // 登録成功
    alert('✅ 記録しました！')

    // レップ数をクリア
    setReps('')

    // メインセットの場合、セット番号を増やしてタイマーを再開
    if (status === 'メイン') {
      setSetNumber(prev => String(Number(prev) + 1))
      resetTimer()
      startTimer()
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-gray-800">💪 筋トレ記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      {/* インターバルタイマー */}
      <IntervalTimer
        remaining={remaining}
        isRunning={isRunning}
        onStart={startTimer}
        onStop={stopTimer}
        onReset={resetTimer}
        onSetPreset={setPreset}
      />

      {/* フォーム入力部分 */}
      <WorkoutFormInputs
        exercises={exercises}
        statuses={statuses}
        exercise={exercise}
        onExerciseChange={setExercise}
        status={status}
        onStatusChange={setStatus}
        weight={weight}
        onWeightChange={setWeight}
        reps={reps}
        onRepsChange={setReps}
        setNumber={setNumber}
        onSetNumberChange={setSetNumber}
        note={note}
        onNoteChange={setNote}
        exerciseOrder={exerciseOrder}
        onExerciseOrderChange={setExerciseOrder}
        onSelectedExerciseChange={setSelectedExercise}
      />

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        記録する
      </button>

      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
      >
        戻る
      </button>

      {/* 選択種目の履歴テーブル */}
      <ExerciseHistoryTable
        selectedExercise={selectedExercise}
        history={exerciseHistory}
      />
    </main>
  )
}
