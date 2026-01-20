'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function WorkoutForm() {
  type Exercise = {
    exercises_id: number
    name: string
    category: string
  }

  type Status = {
    id: string
    name: string
  }

  type Set = {
    id: string
    date: string
    exercise: string
    weight: number
    reps: number
    set_number: number | null
    status: string
    note: string
    exercise_order: number
  }

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [exercise, setExercise] = useState('')
  const [status, setStatus] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [note, setNote] = useState('')
  const [setNumber, setSetNumber] = useState('')
  const [exerciseOrder, setExerciseOrder] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseHistory, setExerciseHistory] = useState<Set[]>([])

  const today = new Date().toISOString().split('T')[0]
  const router = useRouter()

  // タイマー関連
  const [timer, setTimer] = useState(120)
  const [remaining, setRemaining] = useState(120)
  const [isRunning, setIsRunning] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    if (isRunning) return
    setIsRunning(true)
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setIsRunning(false)
          triggerVibration()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIntervalId(id)
  }

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId)
    setIsRunning(false)
  }

  const resetTimer = () => {
    stopTimer()
    setRemaining(timer)
  }

  const setPreset = (seconds: number) => {
    stopTimer()
    setTimer(seconds)
    setRemaining(seconds)
  }

  const triggerVibration = () => {
    if (typeof window !== 'undefined') {
      // バイブレーション
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 300, 500])
      }

      // 音声再生（クライアント側のみ）
      const audio = new Audio('/sound/Cell_Phone.mp3')
      audio.play().catch(err => {
        console.error('音声再生エラー:', err)
      })
    }
  }

  useEffect(() => {
    const fetchMasters = async () => {
      const { data: ex } = await supabase
        .from('exercises')
        .select('exercises_id, name, category')
        .order('exercises_id', { ascending: true })

      const { data: st } = await supabase
        .from('statuses')
        .select('*')
        .order('statuses_id', { ascending: true })

      setExercises(ex ?? [])
      setStatuses(st ?? [])
    }
    fetchMasters()
  }, [])

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('sets')
        .select('id')
        .eq('date', today)

      const count = data?.length ?? 0
      setExerciseOrder(String(count + 1))
    }

    fetchOrder()
  }, [exercise, status, weight, reps])

  useEffect(() => {
    const fetchAutoValues = async () => {
      if (status !== 'メイン' || !exercise) return

      const { data: previousData } = await supabase
        .from('sets')
        .select('date, weight')
        .eq('exercise', exercise)
        .eq('status', 'メイン')
        .order('date', { ascending: false })

      const previous = previousData?.[0]

      if (previous) {
        setWeight(String(previous.weight))
      } else {
        setWeight('')
      }

      const { data: todayData } = await supabase
        .from('sets')
        .select('set_number')
        .eq('date', today)
        .eq('exercise', exercise)
        .eq('status', 'メイン')

      const count = todayData?.length ?? 0
      setSetNumber(String(count + 1))
    }

    fetchAutoValues()
  }, [status, exercise])

  useEffect(() => {
    const fetchExerciseHistory = async () => {
      if (!selectedExercise) {
        setExerciseHistory([])
        return
      }

      const { data } = await supabase
        .from('sets')
        .select('*')
        .eq('exercise', selectedExercise)
        .order('date', { ascending: false })
        .order('set_number', { ascending: true })

      setExerciseHistory(data ?? [])
    }

    fetchExerciseHistory()
  }, [selectedExercise])

  const handleSubmit = async () => {
    if (
      !exercise ||
      !status ||
      !weight ||
      !reps ||
      !exerciseOrder ||
      (status === 'メイン' && !setNumber)
    ) {
      alert('⚠️ 必須項目が未入力です。すべて入力してください。')
      return
    }

    const { error } = await supabase.from('sets').insert([
      {
        date: today,
        exercise,
        status,
        weight: Number(weight),
        reps: Number(reps),
        note,
        set_number: status === 'メイン' ? Number(setNumber) : null,
        exercise_order: Number(exerciseOrder)
      }
    ])

    if (error) {
      alert('登録失敗: ' + error.message)
    } else {
      alert('✅ 記録しました！')
      setReps('')
      if (status === 'メイン') {
        setSetNumber(prev => String(Number(prev) + 1))
        resetTimer()
        startTimer()
      }
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-gray-800">💪 筋トレ記録</h1>
      <p className="text-gray-600">📅 日付: {today}</p>

      {/* ⏱️ インターバル */}
      <div className="bg-gray-100 p-4 rounded shadow space-y-2 mt-6">
        <h2 className="text-lg font-semibold text-gray-700">⏱️ インターバル</h2>
        <p className="text-2xl font-mono text-center">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </p>

        <div className="flex justify-center gap-2">
          <button onClick={() => setPreset(120)} className="bg-blue-500 text-white px-3 py-1 rounded">2分</button>
          <button onClick={() => setPreset(180)} className="bg-blue-500 text-white px-3 py-1 rounded">3分</button>
          <button onClick={() => setPreset(300)} className="bg-blue-500 text-white px-3 py-1 rounded">5分</button>
          <button onClick={() => setPreset(5)} className="bg-blue-500 text-white px-3 py-1 rounded">テスト用</button>
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <button onClick={startTimer} className="bg-green-500 text-white px-4 py-1 rounded">スタート</button>
          <button onClick={stopTimer} className="bg-yellow-500 text-white px-4 py-1 rounded">ストップ</button>
          <button onClick={resetTimer} className="bg-red-500 text-white px-4 py-1 rounded">リセット</button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 入力フォーム */}
        <div>
          <label className="block font-medium mb-1">種目 <span className="text-red-500">*</span></label>
          <select
            value={exercise}
            onChange={e => {
              const value = e.target.value
              setExercise(value)
              setSelectedExercise(value)
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

        <div>
          <label className="block font-medium mb-1">ステータス <span className="text-red-500">*</span></label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-2 rounded">
            <option value="">選択してください</option>
            {statuses.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {status === 'メイン' && (
          <div>
            <label className="block font-medium mb-1">セット番号 <span className="text-red-500">*</span></label>
            <input type="number" value={setNumber} onChange={e => setSetNumber(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">重量 (kg) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-1">
            {/* 整数部分のセレクトボックス */}
            <select
              value={Math.floor(Number(weight) || 0)}
              onChange={(e) => {
                const intVal = e.target.value;
                const decVal = (Number(weight) % 1).toFixed(1).split('.')[1] || '0';
                setWeight(`${intVal}.${decVal}`);
              }}
              className="flex-1 border p-2 rounded bg-white"
            >
              <option value="">（kg）</option>
              {Array.from({ length: 301 }, (_, i) => i).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <span className="text-xl font-bold">.</span>

            {/* 小数部分のセレクトボックス */}
            <select
              value={(Number(weight) % 1).toFixed(1).split('.')[1] || '0'}
              onChange={(e) => {
                const intVal = Math.floor(Number(weight) || 0);
                const decVal = e.target.value;
                setWeight(`${intVal}.${decVal}`);
              }}
              className="w-24 border p-2 rounded bg-white"
            >
              {Array.from({ length: 10 }, (_, i) => i).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            
            <span className="ml-1 text-gray-600">kg</span>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">回数 (rep) <span className="text-red-500">*</span></label>
          <select value={reps} onChange={e => setReps(e.target.value)} className="w-full border p-2 rounded">
            <option value="">選択してください</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(n =><option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">備考（任意）</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div>
        <label className="block font-medium mb-1">種目順序 <span className="text-red-500">*</span></label>
        <input type="number" value={exerciseOrder} readOnly className="w-full border p-2 rounded bg-gray-100" />
      </div>

      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        記録する
      </button>

      <button onClick={() => router.back()} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
        戻る
      </button>
    </div>


    {/* 📌 選択種目の全記録 */}
    <div className="bg-white border rounded-lg shadow p-4 w-full mt-6">
      <h2 className="text-lg font-semibold mb-4">
  📌 {selectedExercise ? `${selectedExercise} の全記録` : '選択種目の全記録'}
      </h2>

      {exerciseHistory.length > 0 && (
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">日付</th>
              <th className="border px-3 py-2 text-right">ステータス</th>
              <th className="border px-3 py-2 text-right">セット数</th>
              <th className="border px-3 py-2 text-right">重量</th>
              <th className="border px-3 py-2 text-right">レップ数</th>
              
            </tr>
          </thead>
          <tbody>
            {exerciseHistory.map((set, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{set.date}</td>
                <td className="border px-3 py-2 text-right">{set.status}</td>
                <td className="border px-3 py-2 text-right">{set.set_number}</td>
                <td className="border px-3 py-2 text-right">{set.weight}</td>
                <td className="border px-3 py-2 text-right">{set.reps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </main>
)
}
