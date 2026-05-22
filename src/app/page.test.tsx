// 細かい型チェックを飛ばす、環境内で競合してしまっている為仕方なく記載
// @ts-nocheck

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Home from './page' // テスト対象のトップページコンポーネント
import { supabase } from '@/lib/supabase'
import * as matchers from '@testing-library/jest-dom/matchers' //
expect.extend(matchers)

// ==========================================
// Supabaseの動きをすり替える
// ==========================================
vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn() // 後から中身を書き換えられるようにモック関数にしておく
    }
  }
})

// 日付ユーティリティも固定値を返すようにモック化（テストの実行日に左右されないようにするため）
vi.mock('@/utils/date', () => ({
  getTodayJST: () => '2026-05-21' // 「今日」を2026年5月21日に固定
}))

describe('トップページ（Home）の結合テスト', () => {

  beforeEach(() => {
    vi.clearAllMocks() // テストごとにモックの履歴をリセット
  })

  it('Supabaseからトレーニング記録を正しくフェッチし、経過日数と今日の記録が画面に統合されて表示されること', async () => {
    
    // 1. Supabaseの `.from()` が呼ばれたときの「偽の戻り値」を細かく設定
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      // 辞書形式で、メソッドチェーン（.select().order().in() など）のガワを模倣する
      const mockQuery: any = {
        select: vi.fn().mockImplementation(() => mockQuery),
        order: vi.fn().mockImplementation(() => mockQuery),
        eq: vi.fn().mockImplementation(() => mockQuery),
        in: vi.fn().mockImplementation(() => mockQuery),
        // 最終的にデータを返す部分
        then: (onfulfilled: any) => {
          if (table === 'exercises') {
            // 種目マスタの偽データ
            return onfulfilled({
              data: [
                { name: 'ベンチプレス', category: '胸' },
                { name: 'ラットプルダウン', category: '背中' }
              ],
              error: null
            })
          }
          if (table === 'sets') {
            // 本来のクエリ条件（今日のものか過去のものか）に応じてデータを出し分けるのが理想ですが、
            // 今回はシンプルに全てのセットデータをまとめて返します。
            return onfulfilled({
              data: [
                // 過去の記録（経過日数計算用）
                { exercise: 'ラットプルダウン', date: '2026-05-14', weight: 60, reps: 10, set_number: 1, exercise_order: 1 }, // 7日前
                // 今日の記録（今日の記録テーブル表示用、かつ0日前計算用）
                { exercise: 'ベンチプレス', date: '2026-05-21', weight: 80, reps: 8, set_number: 1, exercise_order: 2 }   // 今日
              ],
              error: null
            })
          }
          return onfulfilled({ data: null, error: null })
        }
      }
      return mockQuery
    })

    // 2. コンポ―ネントを実際に仮想ブラウザ上にレンダリング（描画）する
    render(<Home />)

    // 3. 非同期処理（useEffect）が完了して、画面が更新されるのを待つ
    // 「トレーニング頻度」テーブルに、計算結果が正しくマッピングされて描画されているか検証
    await waitFor(() => {
      // ラットプルダウン（背中）が 2026-05-14 から計算されて「7日前」になっているか
      expect(screen.getByText('背中')).toBeInTheDocument()
      expect(screen.getByText('7 日前')).toBeInTheDocument()

      // ベンチプレス（胸）が 2026-05-21 から計算されて「0 日前」になっているか
      expect(screen.getByText('胸')).toBeInTheDocument()
      expect(screen.getByText('0 日前')).toBeInTheDocument()
    })

    // 4. 「今日の記録」テーブルにもデータが流れ込んでいるか検証
    await waitFor(() => {
      expect(screen.getByText('今日の記録')).toBeInTheDocument()
      // テーブル内に、今日実施した「ベンチプレス」の種目名と重量が表示されているか
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument()
      expect(screen.getByText('80')).toBeInTheDocument() // 重量
      expect(screen.getByText('8')).toBeInTheDocument()  // レップ数
    })
  })

  it('Supabaseからのデータが空の場合に、「データがありません」と表示されること', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      const mockQuery: any = {
        select: vi.fn().mockImplementation(() => mockQuery),
        order: vi.fn().mockImplementation(() => mockQuery),
        eq: vi.fn().mockImplementation(() => mockQuery),
        in: vi.fn().mockImplementation(() => mockQuery),
        then: (onfulfilled: any) => {
          return onfulfilled({
            data: [],
            error: null
          })
        }
      }
      return mockQuery
    })

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('データがありません')).toBeInTheDocument()
    })

    // 今日の記録テーブルには種目が表示されていないこと
    expect(screen.queryByText('ベンチプレス')).not.toBeInTheDocument()
  })

  it('各機能へのナビゲーションリンクが正しく表示され、正しいhrefを持っていること', async () => {
    render(<Home />)

    await waitFor(() => {
      const workoutLink = screen.getByText('💪 筋トレ記録')
      expect(workoutLink).toBeInTheDocument()
      expect(workoutLink.closest('a')).toHaveAttribute('href', '/workout')

      const dropsetLink = screen.getByText('🔥 短時間用筋トレ記録')
      expect(dropsetLink).toBeInTheDocument()
      expect(dropsetLink.closest('a')).toHaveAttribute('href', '/dropset')

      const weightLink = screen.getByText('⚖️ 体重記録')
      expect(weightLink).toBeInTheDocument()
      expect(weightLink.closest('a')).toHaveAttribute('href', '/weight')

      const chartLink = screen.getByText('📊 グラフ表示')
      expect(chartLink).toBeInTheDocument()
      expect(chartLink.closest('a')).toHaveAttribute('href', '/chart')

      const historyLink = screen.getByText('📝 履歴表示')
      expect(historyLink).toBeInTheDocument()
      expect(historyLink.closest('a')).toHaveAttribute('href', '/history')

      const chatLink = screen.getByText('🤖 AIコーチング')
      expect(chatLink).toBeInTheDocument()
      expect(chatLink.closest('a')).toHaveAttribute('href', '/chat')

      const csvLink = screen.getByText('🗂️ CSV出力')
      expect(csvLink).toBeInTheDocument()
      expect(csvLink.closest('a')).toHaveAttribute('href', '/csv')

      const masterLink = screen.getByText('🛠️ マスタ管理')
      expect(masterLink).toBeInTheDocument()
      expect(masterLink.closest('a')).toHaveAttribute('href', '/master')

      const developLink = screen.getByText('🧪 実験用ページ')
      expect(developLink).toBeInTheDocument()
      expect(developLink.closest('a')).toHaveAttribute('href', '/develop')
    })
  })
})