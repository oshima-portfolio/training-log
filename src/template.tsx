// template.tsx
// Ayachika専用：トレーニングログアプリ開発に必要な構文・型・UI・DB操作を一括管理
// Next.js App Router + TypeScript + Tailwind CSS + Supabase に対応

// ------------------------------
// ✅ import の基本構文
// ------------------------------
import React from 'react'; // JSXを使う場合
import { useState, useEffect } from 'react'; // Reactフック
import { format } from 'date-fns'; // 日付整形
import TrainingList from '@/components/TrainingList'; // 自作コンポーネント
import { getTrainings } from '@/lib/getTrainings'; // Supabase連携関数
import type { Training } from '@/types/training'; // 型定義のみ

// ------------------------------
// ✅ ディレクトリ構成例（コメント）
// ------------------------------
/*
src/
├── app/
│   └── page.tsx
├── components/
│   └── TrainingList.tsx
├── lib/
│   └── getTrainings.ts
├── types/
│   └── training.ts
├── styles/
│   └── globals.css
*/

// ------------------------------
// ✅ 型定義（types/training.ts）
// ------------------------------
export type Training = {
  id: number;             // 一意のID（主キー）
  user_id: string;        // ユーザーID（Supabase Authと連携する場合）
  exercise: string;       // 種目名（例: "bench press"）
  weight: number;         // 重量（kg）
  reps: number;           // 回数
  sets: number;           // セット数
  date: string;           // 記録日（ISO形式: "2025-10-08"）
  memo?: string;          // 任意のメモ
  created_at?: string;    // Supabaseが自動生成する作成日時
};

// ------------------------------
// ✅ ページ定義（app/page.tsx）
// ------------------------------
import { getTrainings } from '@/lib/getTrainings';
import TrainingList from '@/components/TrainingList';

export default async function Home() {
  const { data: trainings } = await getTrainings();
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Training Log</h1>
      <TrainingList trainings={trainings} />
    </main>
  );
}

// ------------------------------
// ✅ Supabase データ取得（lib/getTrainings.ts）
// ------------------------------
import { createClient } from '@supabase/supabase-js';
import type { Training } from '@/types/training';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 全件取得
export async function getTrainings(): Promise<{ data: Training[] | null; error: any }> {
  const { data, error } = await supabase.from('trainings').select('*');
  return { data, error };
}

// 条件付き取得（今日の記録）
export async function getTodayTrainings() {
  const today = new Date().toISOString().split('T')[0];
  return await supabase.from('trainings').select('*').eq('date', today);
}

// 並び替え（新しい順）
export async function getSortedTrainings() {
  return await supabase.from('trainings').select('*').order('date', { ascending: false });
}

// 複数条件（種目と重量）
export async function getFilteredTrainings() {
  return await supabase
    .from('trainings')
    .select('*')
    .eq('exercise', 'bench press')
    .gte('weight', 60);
}

// ------------------------------
// ✅ 表示コンポーネント（components/TrainingList.tsx）
// ------------------------------
import type { Training } from '@/types/training';

type Props = {
  trainings: Training[];
};

export default function TrainingList({ trainings }: Props) {
  return (
    <ul className="space-y-2">
      {trainings.map((t) => (
        <li key={t.id} className="border p-2 rounded">
          <div className="font-bold">{t.exercise}</div>
          <div>{t.weight}kg × {t.reps}回 × {t.sets}セット</div>
          <div className="text-sm text-gray-500">{t.date}</div>
          {t.memo && <div className="italic text-gray-600">メモ: {t.memo}</div>}
        </li>
      ))}
    </ul>
  );
}

// ------------------------------
// ✅ useState（状態管理）
// ------------------------------
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)} className="bg-blue-500 text-white px-4 py-2 rounded">
      カウント: {count}
    </button>
  );
}

// ------------------------------
// ✅ useEffect（副作用処理）
// ------------------------------
'use client';

import { useEffect, useState } from 'react';

export function Timer() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>経過時間: {time}秒</p>;
}

// ------------------------------
// ✅ router.push（ページ遷移）
// ------------------------------
'use client';

import { useRouter } from 'next/navigation';

export function GoToDetail({ id }: { id: number }) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(`/detail/${id}`)} className="underline text-blue-600">
      詳細を見る
    </button>
  );
}

// ------------------------------
// ✅ フォーム送信（onSubmit）
// ------------------------------
'use client';

import { useState } from 'react';

export function TrainingForm() {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('trainings').insert([
      { exercise, weight, reps: 10, sets: 3, date: new Date().toISOString().split('T')[0] },
    ]);
    if (error) console.error(error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        className="border p-2 w-full"
        placeholder="種目名"
      />
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="border p-2 w-full"
        placeholder="重量 (kg)"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        登録
      </button>
    </form>
  );
}

// ------------------------------
// ✅ 条件分岐レンダリング
// ------------------------------
export function Conditional({ trainings }: { trainings: Training[] }) {
  return trainings.length === 0 ? (
    <p className="text-gray-500">記録がありません</p>
  ) : (
    <TrainingList trainings={trainings} />
  );
}

// ------------------------------
// ✅ 日付整形（date-fns）
// ------------------------------
import { format } from 'date-fns';

export function FormattedDate({ date }: { date: string }) {
  const formatted = format(new Date(date), 'yyyy-MM-dd');
  return <span>{formatted}</span>;
}

// ------------------------------
// ✅ Tailwind CSS よく使うクラス一覧
// ------------------------------
/*
  p-4         → padding（内側の余白）
  m-2         → margin（外側の余白）
  text-xl     → 文字サイズ
  font-bold   → 太字
  bg-gray-100 → 背景色
  rounded     → 角丸
  hover:bg-blue-500 → ホバー時の背景色
  flex, justify-between, items-center → レイアウト調整
*/

// ------------------------------
// ✅ よく使うHTMLタグ一覧（JSX対応）
// ------------------------------
// JSXでは class → className, for → htmlFor に変換されるので注意！

export default function HtmlTagsExample() {
  return (
    <main className="p-4 space-y-6">
      {/* 見出し */}
      <h1 className="text-2xl font-bold">トレーニングログ</h1>
      <h2 className="text-xl font-semibold">今日の記録</h2>

      {/* 段落 */}
      <p className="text-gray-700">ベンチプレス 60kg × 10回 × 3セット</p>

      {/* リスト */}
      <ul className="list-disc pl-6">
        <li>スクワット</li>
        <li>デッドリフト</li>
        <li>ベンチプレス</li>
      </ul>

      {/* ボタン */}
      <button onClick={() => alert('クリックされた！')} className="bg-blue-500 text-white px-4 py-2 rounded">
        実行する
      </button>

      {/* 入力フォーム */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <label htmlFor="exercise" className="block font-medium">種目名</label>
        <input
          id="exercise"
          type="text"
          className="border p-2 w-full"
          placeholder="例: bench press"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>

      {/* 画像 */}
      <img src="/logo.png" alt="アプリのロゴ" className="w-32 h-auto" />

      {/* リンク */}
      <a href="/about" className="text-blue-600 underline">このアプリについて</a>

      {/* 区切り線 */}
      <hr className="my-6 border-gray-300" />

      {/* フッター */}
      <footer className="text-sm text-gray-500">
        © 2025 Ayachika Training Log
      </footer>
    </main>
  );
}
