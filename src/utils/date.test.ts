import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayJST, toJSTString } from './date';

describe('date utils', () => {
  describe('getTodayJST', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('JSTの本日日付を yyyy-MM-dd 形式で返すべき（UTCで深夜0時の場合、JSTは午前9時で同日）', () => {
      // 2026-05-22T00:00:00Z (UTC) -> 2026-05-22T09:00:00+09:00 (JST)
      const mockDate = new Date('2026-05-22T00:00:00Z');
      vi.setSystemTime(mockDate);
      expect(getTodayJST()).toBe('2026-05-22');
    });

    it('JSTの本日日付を yyyy-MM-dd 形式で返すべき（UTCで23時＝翌日JST）', () => {
      // 2026-05-22T23:00:00Z (UTC) -> 2026-05-23T08:00:00+09:00 (JST)
      const mockDate = new Date('2026-05-22T23:00:00Z');
      vi.setSystemTime(mockDate);
      expect(getTodayJST()).toBe('2026-05-23');
    });
  });

  describe('toJSTString', () => {
    it('DateオブジェクトをJSTの日付文字列に正しく変換すべき', () => {
      // 2026-05-22T15:00:00Z (UTC) -> 2026-05-23T00:00:00+09:00 (JST)
      const date = new Date('2026-05-22T15:00:00Z');
      expect(toJSTString(date)).toBe('2026-05-23');
    });

    it('ISO日付文字列をJSTの日付文字列に正しく変換すべき', () => {
      expect(toJSTString('2026-05-22T12:00:00Z')).toBe('2026-05-22'); // 21:00 JST
      expect(toJSTString('2026-05-22T16:00:00Z')).toBe('2026-05-23'); // 01:00 JST
    });

    it('タイムスタンプ数値（ミリ秒）をJSTの日付文字列に正しく変換すべき', () => {
      const timestamp = new Date('2026-05-22T10:00:00Z').getTime();
      expect(toJSTString(timestamp)).toBe('2026-05-22');
    });
  });
});
