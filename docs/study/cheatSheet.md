# 🚀 React & Next.js (App Router) 開発者Wiki & チートシート

本ドキュメントは、プロジェクト開発において「いつでも基本の型・思想に立ち返る」ための用語集兼マニュアルである。数ヶ月後の自分や、新しく参画したメンバーが迷子にならないための道標として活用すること。

---

## 🛑 1. コア思想：データの流れの「黄金律」

Reactの基本は **「単方向データフロー（State Up, Props Down）」** である。コンポーネント間でデータを同期・連動させたいときは、必ずこの原則に沿って設計する。

* **状態（State）**: データを共有したい子コンポーネントたちの「共通の親（またはカスタムフック）」に持たせる。
* **Props（プロパティ）**: データや状態は、親から子へ**下向きに**流す。
* **イベントハンドラ**: ユーザーの操作（値の変更やクリック）は、子から親へ関数を呼び出すことで**上向きに**伝える。

```text
       【 共通の親フック / useWorkoutForm 】
       │  ▲                               ▲
       │  │ (イベント発火: onChange)       │ (イベント発火: onSubmit)
       │  │                               │
(Props │  │                        (Props │  │
 注入) │  │                         注入) │  │
       ▼  │                               ▼  │
【 WorkoutFormInputs 】           【 ExerciseHistoryTable 】
 (ユーザーが種目を選択)              (選ばれた種目の履歴を自動描画)
```

---

## 📚 2. 重要用語集（Reactの基本機能）

### 2.1 State（状態）
* **概要**: コンポーネントが内部に持つ「変化するデータ」の箱。
* **文法**: `const [state, setState] = useState(initialValue);`
* **Wikiメモ**: Stateが更新されると、ReactはそのStateを持つコンポーネントと、その下にある子コンポーネントすべてを**自動的に再レンダリング（再描画）**する。

### 2.2 Props（プロパティ）
* **概要**: 親コンポーネントから子コンポーネントへ渡される「引数（設定値）」。
* **Wikiメモ**: Propsは**読み取り専用（Immutable）**である。子コンポーネント側からPropsの値を直接書き換えてはならない。値を変更したい場合は、親から渡された「Stateを変更するための関数（`setXXX`）」を子から呼び出す。

### 2.3 useEffect（副作用）
* **概要**: コンポーネントのレンダリングと同期して、「外部システム」と通信・連携を行うための仕組み。
* **文法**:
  ```typescript
  useEffect(() => {
      // 実行したい処理（例：Supabaseからのデータ取得）
      return () => { /* クリーンアップ処理（タイマーの解除など） */ }
  }, [依存配列]);
  ```
* **トリガー判定のルール**:
  - `[]`（空配列）: コンポーネントが画面に最初に表示された時（マウント時）に1回だけ実行。
  - `[selectedExercise]` : `selectedExercise` の値が変化するたびに実行。

---

## 🛠️ 3. プロジェクトにおける「ファイルの境界線」

スパゲティコード化を防ぐため、ファイルの役割（関心の分離）を厳格に割り振る。

### 🎨 ① 見た目の箱：UIコンポーネント (`components/`)
* **役割**: Tailwind CSSを用いたHTML構造の構築とスタイル適用。
* **ルール**: 原則として内部に大きなStateを持たない。**「Propsでデータをもらって綺麗に表示するだけ」**のクリーンなパーツ（操り人形）に徹する。
* **本アプリでの例**: `ExerciseHistoryTable.tsx`, `IntervalTimer.tsx`

### 🧠 ② 頭脳の箱：カスタムフック (`hooks/`)
* **役割**: 画面の「ロジック（動きのルール）」の一元管理。
* **ルール**: `useState`、`useEffect`、Supabaseとの非同期通信、タイマーのカウントダウン処理などはすべてここに隠蔽する。
* **本アプリでの例**: `useWorkoutForm.ts`, `useIntervalTimer.ts`

### 📐 ③ 計算の箱：ユーティリティ (`utils/`)
* **役割**: Reactの仕組み（状態や画面描画）に依存しない、純粋なJavaScript/TypeScriptの関数。
* **ルール**: 引数を受け取って、特定の計算結果を返すだけの「テストしやすい関数」を置く。
* **本アプリでの例**: `workoutHelpers.ts` （必須入力チェックや数値への型キャストなど）

---

## ⚠️ 4. アンチパターン（やってはいけない実装）と対策

### ❌ 4.1 useEffect の乱用（イベント起点の処理）
* **ダメな例**: 「保存ボタンが押された」ことを検知するためにStateを書き換え、それを `useEffect` で監視してSupabaseへ送信する。
  - *理由*: データの流れが複雑になり、無限ループや予期せぬタイミングでの二重送信バグを引き起こす。
* **⭕ 正解の型**: ボタンの `onClick` やフォームの `onSubmit` などの**イベントハンドラ関数の中で直接ロジックを呼び出す**。

### ❌ 4.2 Propsの値を子側の初期Stateにコピーする
* **ダメな例**:
  ```typescript
  // ExerciseHistoryTable 内でのNG実装
  const [localHistory, setLocalHistory] = useState(props.history);
  ```
  - *理由*: 親側で種目が切り替わって `props.history` が新しくなっても、子コンポーネントの `useState` の初期化は最初の1回しか走らないため、画面の履歴表示が古いまま連動しなくなる。
* **⭕ 正解の型**: 渡された `props.history` をそのまま `.map()` で直接レンダリングする。

---

## 🚀 5. Next.js (App Router) 独自の重要ルール

### 5.1 'use client' （クライアントコンポーネント）
* **意味**: このファイルは「ブラウザ（ユーザーの画面）側」で動くパーツであるとNext.jsに宣言するキーワード。
* **使うべきタイミング**:
  - `useState` や `useEffect` などのReactのフック機能を使用するとき。
  - `onClick` や `onChange` など、ユーザーのマウス・キーボード操作を検知するとき。
  - `navigator.vibrate()` や `Audio` などのブラウザ専用APIを叩くとき。
* **配置**: ファイルの**絶対最先頭（1行目）**に記述すること。

---

## 📝 6. コピペで使える文法の基本スニペット

### ① コンポーネントの基本形（TypeScript）
```tsx
import type { WorkoutSet } from '@/types/types'

type TableProps = {
    selectedExercise: string
    history: WorkoutSet[]
}

export default function ExerciseHistoryTable({ selectedExercise, history }: TableProps) {
    return (
        <div>
            <h3>{selectedExercise || '種目未選択'}</h3>
            {/* 条件付きレンダリング: データがある時だけ表示 */}
            {history.length > 0 && (
                <ul>
                    {history.map((set, idx) => (
                        <li key={idx}>{set.weight}kg</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
```

### ② カスタムフックの基本形
```typescript
import { useState, useEffect } from 'react'

export function useIntervalTimer(initialSeconds = 120) {
    const [seconds, setSeconds] = useState(initialSeconds)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1)
            }, 1000)
        }
        return () => { if (interval) clearInterval(interval) }
    }, [isActive, seconds])

    return { seconds, isActive, start: () => setIsActive(true) }
}
```