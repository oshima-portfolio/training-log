import { DropsetRoutine } from '@/types/types';

/**
 * セットのレップ数に基づいてルーチンの情報を更新するロジック
 * 
 * 【成功】: reps >= threshold_reps
 * consecutive_success を +1, consecutive_failure を 0 にリセット
 * consecutive_success が 2 に達したら、weight を +2.5 し、カウンタを 0 に戻す。
 * 
 * 【失敗】: reps < demotion_threshold
 * consecutive_failure を +1, consecutive_success を 0 にリセット
 * consecutive_failure が 2 に達したら、weight を -2.5 (下限0) し、カウンタを 0 に戻す。
 * 
 * 【維持】: 上記以外
 * consecutive_success と consecutive_failure を両方 0 にリセット
 * 重量変更なし
 * 
 * @param routine 現在のルーチン情報
 * @param reps 実施したレップ数
 * @returns 更新後のルーチン情報と通知メッセージ
 */
export function calculateNextRoutine(
  routine: DropsetRoutine,
  reps: number
): { updatedRoutine: DropsetRoutine; message: string | null } {
  const updated = { ...routine };
  let message: string | null = null;

  if (reps >= routine.threshold_reps) {
    // 成功
    updated.consecutive_success += 1;
    updated.consecutive_failure = 0;

    if (updated.consecutive_success >= 2) {
      updated.weight += 2.5;
      updated.consecutive_success = 0;
      message = `🎉 重量アップ！ ${routine.weight}kg -> ${updated.weight}kg`;
    }
  } else if (reps < routine.demotion_threshold) {
    // 失敗
    updated.consecutive_failure += 1;
    updated.consecutive_success = 0;

    if (updated.consecutive_failure >= 2) {
      updated.weight = Math.max(0, updated.weight - 2.5);
      updated.consecutive_failure = 0;
      if (updated.weight !== routine.weight) {
        message = `📉 重量ダウン... ${routine.weight}kg -> ${updated.weight}kg`;
      }
    }
  } else {
    // 維持
    updated.consecutive_success = 0;
    updated.consecutive_failure = 0;
  }

  return { updatedRoutine: updated, message };
}
