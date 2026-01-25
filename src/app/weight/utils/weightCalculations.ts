import type { WeightRecord, WeightHistoryEntry, MonthlyAverage } from '@/types/types'

/**
 * 体重データの前週比を計算
 * 
 * 指定日の体重と、前週（7日前の週の平均）を比較して差分を計算します。
 * 前週のデータがない場合はnullを返します。
 * 
 * @param currentDate - 現在の日付
 * @param currentWeight - 現在の体重
 * @param allData - すべての体重データ
 * @returns {string | null} 前週比（kg）、データがない場合はnull
 */
export const calculateWeekDiff = (
    currentDate: Date,
    currentWeight: number,
    allData: WeightRecord[]
): string | null => {
    // 前週の期間を算出（7日前の週：8日前〜2日前）
    const weekAgoStart = new Date(currentDate)
    weekAgoStart.setDate(currentDate.getDate() - 7)
    const weekAgoEnd = new Date(currentDate)
    weekAgoEnd.setDate(currentDate.getDate() - 1)

    // 前週のデータを抽出
    const pastWeek = allData.filter(e => {
        const d = new Date(e.date)
        return d >= weekAgoStart && d <= weekAgoEnd
    })

    // 前週のデータがない場合はnull
    if (pastWeek.length === 0) return null

    // 前週の平均体重を計算
    const avgWeek = pastWeek.reduce((sum, e) => sum + e.weight, 0) / pastWeek.length

    // 差分を計算（現在 - 前週平均）
    const diffWeek = currentWeight - avgWeek

    return diffWeek.toFixed(1)
}

/**
 * 体重データの先月比を計算
 * 
 * 指定日の体重と、先月の平均体重を比較して差分を計算します。
 * 先月のデータがない場合はnullを返します。
 * 
 * @param currentDate - 現在の日付
 * @param currentWeight - 現在の体重
 * @param allData - すべての体重データ
 * @returns {string | null} 先月比（kg）、データがない場合はnull
 */
export const calculateMonthDiff = (
    currentDate: Date,
    currentWeight: number,
    allData: WeightRecord[]
): string | null => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // 先月の期間を算出
    const lastMonthStart = new Date(year, month - 1, 1)
    const lastMonthEnd = new Date(year, month, 0)

    // 先月のデータを抽出
    const lastMonthData = allData.filter(e => {
        const d = new Date(e.date)
        return d >= lastMonthStart && d <= lastMonthEnd
    })

    // 先月のデータがない場合はnull
    if (lastMonthData.length === 0) return null

    // 先月の平均体重を計算
    const avgMonth = lastMonthData.reduce((sum, e) => sum + e.weight, 0) / lastMonthData.length

    // 差分を計算（現在 - 先月平均）
    const diffMonth = currentWeight - avgMonth

    return diffMonth.toFixed(1)
}

/**
 * 体重データに前週比・先月比を付与
 * 
 * 各体重記録に対して、前週比と先月比を計算して追加します。
 * 
 * @param data - 元の体重データ
 * @returns {WeightHistoryEntry[]} 前週比・先月比を含む体重履歴データ
 */
export const enrichWeightData = (data: WeightRecord[]): WeightHistoryEntry[] => {
    return data.map(entry => {
        const currentDate = new Date(entry.date)

        return {
            ...entry,
            diffFromLastWeek: calculateWeekDiff(currentDate, entry.weight, data),
            diffFromLastMonth: calculateMonthDiff(currentDate, entry.weight, data)
        }
    })
}

/**
 * 直近1ヶ月分のデータをフィルタ
 * 
 * @param data - 体重履歴データ
 * @returns {WeightHistoryEntry[]} 直近1ヶ月分のデータ
 */
export const filterRecentMonth = (data: WeightHistoryEntry[]): WeightHistoryEntry[] => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    return data.filter(e => new Date(e.date) >= oneMonthAgo)
}

/**
 * 月別の平均体重を計算
 * 
 * すべての体重データを月ごとにグループ化し、各月の平均を算出します。
 * 
 * @param data - すべての体重データ
 * @returns {MonthlyAverage[]} 月別平均体重データ（新しい月順）
 */
export const calculateMonthlyAverages = (data: WeightRecord[]): MonthlyAverage[] => {
    // 月ごとのデータを集計
    const monthMap = new Map<string, { total: number; count: number }>()

    data.forEach(e => {
        const d = new Date(e.date)
        // YYYY-MM 形式の年月キーを作成
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

        const current = monthMap.get(yearMonth) || { total: 0, count: 0 }
        monthMap.set(yearMonth, {
            total: current.total + e.weight,
            count: current.count + 1
        })
    })

    // 平均を計算してソート
    return Array.from(monthMap.entries())
        .map(([month, stats]) => ({
            month,
            average: (stats.total / stats.count).toFixed(1)
        }))
        .sort((a, b) => b.month.localeCompare(a.month)) // 新しい月順
}
