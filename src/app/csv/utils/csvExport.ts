import type { WorkoutSet } from '@/types/types'

/**
 * CSV生成ユーティリティ
 * 
 * トレーニングデータと体重データをCSVフォーマットに変換します。
 */

/**
 * CSVセルの値をエスケープ
 * ダブルクォートを二重化してCSV形式に適合させます
 * 
 * @param value - エスケープする値
 * @returns エスケープされた文字列
 */
const escapeCSVCell = (value: string | number): string => {
    return `"${String(value).replace(/"/g, '""')}"`
}

/**
 * トレーニングデータをCSV形式に変換
 * 
 * @param sets - トレーニングセットデータ
 * @param weightsMap - 日付ごとの体重マップ
 * @returns CSV形式の文字列
 */
export const generateTrainingCSV = (
    sets: WorkoutSet[],
    weightsMap: Record<string, number>
): string => {
    // CSVヘッダー
    const header = [
        'date',
        'body_weight',
        'exercise',
        'set_number',
        'weight',
        'reps',
        'status',
        'note',
        'exercise_order'
    ]

    // データ行を生成
    const rows = sets.map(set => {
        const dateKey = formatDate(set.date)
        const bodyWeight = weightsMap[dateKey] ?? '-'

        return [
            dateKey,
            bodyWeight,
            set.exercise,
            set.set_number ?? '',
            set.weight,
            set.reps,
            set.status,
            set.note ?? '',
            set.exercise_order
        ]
    })

    // ヘッダーとデータ行を結合してCSV文字列を生成
    return [header, ...rows]
        .map(row => row.map(cell => escapeCSVCell(cell)).join(','))
        .join('\n')
}

/**
 * 日付文字列をYYYY-MM-DD形式にフォーマット
 * 
 * @param dateStr - ISO形式の日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * CSV文字列からBlobを生成してダウンロード
 * 
 * @param csvContent - CSV形式の文字列
 * @param filename - ダウンロードするファイル名（拡張子なし）
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
    // BlobオブジェクトとしてCSVを作成
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    // ダウンロード用のリンクを作成して自動クリック
    const link = document.createElement('a')
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.setAttribute('download', `${filename}_${today}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
