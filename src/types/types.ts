/**
 * Training Log アプリケーション共通型定義
 * 
 * このファイルには、アプリケーション全体で使用される共通の型を定義しています。
 * 各ページで重複していた型定義を集約し、一元管理することで保守性を向上させます。
 */

/**
 * 種目情報
 * データベースのexercisesテーブルに対応
 */
export type Exercise = {
  /** 種目ID */
  exercises_id: number
  /** 種目名（例: "ベンチプレス", "スクワット"） */
  name: string
  /** カテゴリ（例: "胸", "脚"） */
  category: string
}

/**
 * ステータス情報
 * データベースのstatusesテーブルに対応
 */
export type Status = {
  /** ステータスID */
  id: string
  /** ステータス名（例: "メイン", "ウォームアップ"） */
  name: string
}

/**
 * トレーニングセット情報
 * データベースのsetsテーブルに対応
 */
export type WorkoutSet = {
  /** セットID */
  id: string
  /** 記録日（YYYY-MM-DD形式） */
  date: string
  /** 種目名 */
  exercise: string
  /** 重量（kg） */
  weight: number
  /** 回数（rep） */
  reps: number
  /** セット番号（メインセットの場合のみ） */
  set_number: number | null
  /** ステータス */
  status: string
  /** 備考 */
  note: string
  /** 種目順序（その日の何番目の種目か） */
  exercise_order: number
}

/**
 * 体重記録情報
 * データベースのweightsテーブルに対応
 */
export type WeightRecord = {
  /** 記録ID */
  id?: string
  /** 記録日（YYYY-MM-DD形式） */
  date: string
  /** 体重（kg） */
  weight: number
}

/**
 * 体重履歴情報（差分計算込み）
 * 表示用に前週比・先月比を含む拡張型
 */
export type WeightHistoryEntry = WeightRecord & {
  /** 前週比（kg、データがない場合はnull） */
  diffFromLastWeek: string | null
  /** 先月比（kg、データがない場合はnull） */
  diffFromLastMonth: string | null
}

/**
 * 月別平均体重情報
 */
export type MonthlyAverage = {
  /** 年月（YYYY-MM形式） */
  month: string
  /** 平均体重（kg） */
  average: string
}

/**
 * チャート表示モード
 */
export type ChartMode = 'daily' | 'weekly' | 'monthly'

/**
 * チャートデータポイント
 * グラフ表示用の総負荷量データ
 */
export type VolumePoint = {
  /** ラベル（日付、週、月など） */
  label: string
  /** 総負荷量（kg） */
  volume: number
}
