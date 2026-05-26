# 詳細設計書（DD）：体重記録機能

## 1. 目的
本ドキュメントは、体重記録機能の実装におけるプログラム構造、内部ロジック、データモデル、およびモジュール間のI/Oについて定義する。

---

## 2. モジュール（ファイル）構成・配置
本機能は、Next.js (App Router) 環境において以下の構成でカプセル化されている。

    weight/
    ├── components/
    │   ├── MonthlyAverageTable.tsx  # 月別平均表示（UI）
    │   └── WeightHistoryTable.tsx   # 直近1ヶ月履歴表示（UI）
    ├── hooks/
    │   └── useWeightData.ts         # データフェッチ・状態管理フック
    ├── utils/
    │   └── weightCalculations.ts   # ビジネスロジック・純粋関数
    └── page.tsx                     # メイン画面コンポーネント（Client Component）

---

## 3. コンポーネント詳細仕様

### 3.1. メイン画面 (`page.tsx`)
* **状態管理（State）**:
  * `weight` (`string`): フォームの選択値を管理。初期値は `''`。
* **内部生成データ**:
  * `weightOptions` (`string[]`): `30.0` から `150.0` まで `0.1` 刻み、計1,201個の文字列配列をループ生成。
    * アルゴリズム: `Array.from` を用いて、`(30 + i * 0.1).toFixed(1)` をマッピング。
* **イベントハンドラ (`handleSubmit`)**:
  1. 事前検証: `!weight` の場合、`alert('体重を選択してください')` を実行して処理中断。
  2. 重複走査: `supabase.from('weights')` に対して `.eq('date', today).limit(1).single()` で検索。
  3. 分岐処理:
     * 既存データあり: 対象IDに対して `.update({ weight: Number(weight) })` を実行。
     * 既存データなし: `.insert([{ date: today, weight: Number(weight) }])` を実行。
  4. 終了処理: エラーがあればアラート表示。正常終了時は `alert('✅ 体重を記録しました！')` 表示後、`setWeight('')` および `location.reload()` を実行。

### 3.2. 月別平均体重テーブル (`components/MonthlyAverageTable.tsx`)
* **インターフェース (Props)**:
  * `data`: `MonthlyAverage[]` (月別平均データの配列)
* **描画ロジック**:
  * **データ空時のハンドリング**: `data.length === 0` の場合、テーブルは描画せず、「データがありません」というテキスト（`text-gray-500`）を返却して早期リターンする。
  * **テーブル構造**: 「年月」と「平均体重 (kg)」の2カラム構成。ヘッダー（`thead`）には淡いブルー（`bg-blue-50`）を適用。
  * **スタイリング**: 各データ行（`tr`）に対して `even:bg-gray-50` を指定し、1行ごとに背景色を切り替えて視認性を向上させる。

### 3.3. 体重履歴テーブル (`components/WeightHistoryTable.tsx`)
* **インターフェース (Props)**:
  * `data`: `WeightHistoryEntry[]` (直近1ヶ月の加工済み履歴配列)
* **描画ロジック**:
  * **データ空時のハンドリング**: `data.length === 0` の場合、「まだ記録がありません」というテキスト（`text-gray-500`）を返却して早期リターンする。
  * **テーブル構造**: 「日付」「体重 (kg)」「前週比」「先月比」の4カラム構成。ヘッダーには `bg-gray-100` を適用。
* **内部プライベート関数 (`formatDiff`)**:
  * **概要**: 前週比・先月比の差分文字列（`diff`）を評価し、色付けおよびフォーマットを施したコンポーネントを生成する。
  * **処理アルゴリズム**:
    1. `diff === null`（比較データ不在）の場合は `—`（エムダッシュ）を表示。
    2. 文字列を `parseFloat` で数値化し、以下の Tailwind CSS クラスを動的に割り当てる。
       * `num > 0` (増加) : `text-red-600` (赤色) + 接頭辞として `+` を付与
       * `num < 0` (減少) : `text-blue-600` (青色)
       * `num === 0` (変化なし) : `text-gray-600` (灰色)
    3. 成形した数値を `<span className={color}>` で囲み、末尾に `kg` を付与して出力する。

---

## 4. カスタムフック仕様 (`hooks/useWeightData.ts`)

### 4.1. 引数および返却値
* **引数**: `today` (`string`) - 今日の日付（YYYY-MM-DD）
* **返却値**:
  * `history` (`WeightHistoryEntry[]`): 直近1ヶ月の加工済み履歴
  * `monthlyAverages` (`MonthlyAverage[]`): 月別平均データ
  * `lastWeight` (`number | null`): 今日を除いた過去最新の体重

### 4.2. ライフサイクル処理 (`useEffect`)
* 依存配列: `[today]`
* **処理フロー**:
  1. `supabase.from('weights').select('date, weight').order('date', { ascending: false })` を実行。
  2. 取得データを `enrichWeightData()` に通して差分を計算。
  3. 加工データを `filterRecentMonth()` に通して `setHistory` に格納。
  4. 取得データ配列から `e.date !== today` となる最初の要素を特定し、その `weight` を `setLastWeight` に格納。
  5. 取得データを `calculateMonthlyAverages()` に通して `setMonthlyAverages` に格納。

---

## 5. ロジック関数仕様 (`utils/weightCalculations.ts`)

### 5.1. `calculateWeekDiff`
* **処理**: 基準日から「7日前」〜「1日前」の範囲にあるレコードの平均値を算出し、`基準日体重 - 前週平均` を `toFixed(1)` の文字列で返す。データ不在時は `null`。

### 5.2. `calculateMonthDiff`
* **処理**: 基準日の前月1日〜前月末日までの全レコードの平均値を算出し、`基準日体重 - 先月平均` を `toFixed(1)` の文字列で返す。データ不在時は `null`。

### 5.3. `enrichWeightData`
* **処理**: 配列を `map` 走査し、各要素に `diffFromLastWeek` と `diffFromLastMonth` プロパティを動的付与して返却。

### 5.4. `filterRecentMonth`
* **処理**: `getTodayJST()` の1ヶ月前の日付オブジェクトを生成。レコードの `date` がそれ以降（`>=`）のものだけを `filter` 抽出。

### 5.5. `calculateMonthlyAverages`
* **処理**: `Map` オブジェクトを用いて `YYYY-MM` をキーに集計。平均算出後、`localeCompare` で年月キーを降順（最新月が先頭）にソートして配列で返却。

---

## 6. データモデル・型定義 (`@/types/types`)

    export interface WeightRecord {
      id: string       // DB主キー
      date: string     // 登録日 (YYYY-MM-DD)
      weight: number   // 体重数値 (kg)
    }

    export interface WeightHistoryEntry extends WeightRecord {
      diffFromLastWeek: string | null   // 前週平均比 (例: "+0.4")
      diffFromLastMonth: string | null  // 先月平均比 (例: "-1.1")
    }

    export interface MonthlyAverage {
      month: string     // 対象月 (YYYY-MM)
      average: string   // 月間平均体重 (例: "58.5")
    }
