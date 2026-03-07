import { formatInTimeZone } from 'date-fns-tz';

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * 現在の日本時間（JST）における日付文字列（YYYY-MM-DD）を取得します。
 */
export function getTodayJST(): string {
  return formatInTimeZone(new Date(), JST_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * 任意の日付（Dateオブジェクトまたは文字列）を日本時間（JST）における日付文字列（YYYY-MM-DD）に変換します。
 */
export function toJSTString(date: Date | string | number): string {
  return formatInTimeZone(new Date(date), JST_TIMEZONE, 'yyyy-MM-dd');
}
