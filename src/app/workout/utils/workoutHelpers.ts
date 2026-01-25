import { supabase } from '@/lib/supabase'

/**
 * ワークアウトフォームのバリデーション
 * 
 * フォームの必須項目がすべて入力されているかチェックします。
 * メインセットの場合はセット番号も必須となります。
 * 
 * @param exercise - 種目名
 * @param status - ステータス
 * @param weight - 重量
 * @param reps - 回数
 * @param exerciseOrder - 種目順序
 * @param setNumber - セット番号（メインの場合のみ必須）
 * @returns {boolean} バリデーション成功の場合true
 */
export const validateWorkoutForm = (
    exercise: string,
    status: string,
    weight: string,
    reps: string,
    exerciseOrder: string,
    setNumber: string
): boolean => {
    // 基本的な必須項目チェック
    if (!exercise || !status || !weight || !reps || !exerciseOrder) {
        return false
    }

    // メインセットの場合はセット番号も必須
    if (status === 'メイン' && !setNumber) {
        return false
    }

    return true
}

/**
 * ワークアウトデータをデータベースに登録
 * 
 * フォームの入力値を使用してデータベースにトレーニング記録を保存します。
 * 
 * @param today - 記録日
 * @param exercise - 種目名
 * @param status - ステータス
 * @param weight - 重量
 * @param reps - 回数
 * @param note - 備考
 * @param setNumber - セット番号
 * @param exerciseOrder - 種目順序
 * @returns {Promise<{success: boolean, error?: string}>} 登録結果
 */
export const submitWorkoutData = async (
    today: string,
    exercise: string,
    status: string,
    weight: string,
    reps: string,
    note: string,
    setNumber: string,
    exerciseOrder: string
) => {
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
        return { success: false, error: error.message }
    }

    return { success: true }
}
