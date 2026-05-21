// 型定義
// 種目マスタ
export type ExerciseMaster = {
    name: string
    category: string
}

// トレーニング記録 
export type RawSet = {
    exercise: string
    date: string
    // 種目と日付以外のデータは何であっても許容する
    [key: string]: any
}

/**
 * 過去の全記録から各部位の最終トレーニング日を特定し、
 * 今日までの経過日数を計算してソートしたリストを返す関数
 */
export function calculatePartDaysAgo(
    exercisesData: ExerciseMaster[],
    setsData: RawSet[],
    todayStr: string
) {
    // 種目マスタから種目名(key):部位(value)の辞書を作成
    const exerciseToCategory: Record<string, string> = {}
    exercisesData.forEach(ex => {
        exerciseToCategory[ex.name] = ex.category
    })

    // BIG3ルール
    const overrides: Record<string, string> = {
        'ベンチプレス': '胸',
        'デッドリフト': '背中',
        'スクワット': '脚',
    }

    // 各部位毎の最新トレーニング日を記録する辞書
    const latestDatesByPart: Record<string, string> = {}

    // 取得した全トレーニング記録(setsData)を1つずつループして解析
    setsData.forEach(set => {
        const exercise = set.exercise
        // 種目名から部位を特定（BIG3優先ルール → 通常マスタの順で適用）
        const category = overrides[exercise] || exerciseToCategory[exercise]

        // 種目が存在しない場合はそのレコードは強制終了
        if (!category) return

        // 各部位に対しトレーニング日付が無い場合は日付を記載する
        if (!latestDatesByPart[category]) {
            latestDatesByPart[category] = set.date
        } else {
            // トレーニング日付がより最新の場合は上書きする
            if (new Date(set.date) > new Date(latestDatesByPart[category])) {
                latestDatesByPart[category] = set.date
            }
        }
    })

    // 今日の日付を取得
    const today = new Date(todayStr)

    // 経過日数を計算
    const records = Object.entries(latestDatesByPart).map(([part, date]) => {
        const daysAgo = Math.floor(
            (today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
        )
        return { part, daysAgo }
    })

    // 経過日数が長い順にソート
    records.sort((a, b) => b.daysAgo - a.daysAgo)

    return records
}