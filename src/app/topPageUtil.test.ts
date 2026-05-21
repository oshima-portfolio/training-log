import { calculatePartDaysAgo } from './topPageUtil'
import { describe, it, expect } from 'vitest'

/*
 * 過去の全記録から各部位の最終トレーニング日を特定し、
 * 今日までの経過日数を計算して降順にソートしたリストを返す関数
 * * 引数は以下
 * exercisesData :データ型:{ name: 文字型, category: 文字型 }
 * sets          :データ型:{ exercise: 文字型, date: 文字型 }
 * DatatodayStr  :文字型(yyyy-mm-dd)
 * */
describe('calculatePartDaysAgo', () => {

  // === 正常系：仕様に沿った正しい入力に対し、期待通りの結果が得られるか ===
  it('経過日数が長い順（降順）に部位がソートされること', () => {
    const exercisesData = [
      { name: '種目A', category: '胸' },
      { name: '種目B', category: '背中' },
      { name: '種目C', category: '脚' },
      { name: '種目D', category: '肩' },
    ]

    const setsData = [
      { exercise: '種目A', date: '2024-01-08' }, // 胸: 2日前
      { exercise: '種目B', date: '2024-01-03' }, // 背中: 7日前
      { exercise: '種目C', date: '2024-01-09' }, // 脚: 1日前
      { exercise: '種目D', date: '2024-01-10' }, // 肩: 今日
    ]

    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    expect(sortedParts).toEqual([
      { part: '背中', daysAgo: 7 }, // 0番目：背中で、かつ7日前
      { part: '胸',   daysAgo: 2 }, // 1番目：胸で、かつ2日前
      { part: '脚',   daysAgo: 1 }, // 2番目：脚で、かつ1日前
      { part: '肩',   daysAgo: 0 }  // 3番目：肩で、かつ0日前
    ])
  })

  // === 異常系：明らかに不正な入力や操作に対し、エラーが適切に返されるか ===
  // ※ 現状は前段階のガード句や空配列の安全処理でカバーしているため保留、必要に応じて追記

  // === 準正常系：有効だが境界に近い、あるいは例外的な入力に対して正しく動作するか ===
  it('種目やセットのデータが空の場合は、空の配列を返すこと', () => {
    const exercisesData: any[] = []
    const setsData: any[] = []
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    expect(sortedParts).toEqual([])
  })

  it('マスタデータに種目がなくても、BIG3（ベンチ・スクワット・デッド）は正しい部位に自動マッピングされること', () => {
    // マスタには何も登録していない状態にする
    const exercisesData: any[] = []
    
    const setsData = [
      { exercise: 'ベンチプレス', date: '2024-01-07' }, // 胸: 3日前
      { exercise: 'デッドリフト', date: '2024-01-08' }, // 背中: 2日前
      { exercise: 'スクワット',   date: '2024-01-06' }, // 脚: 4日前
    ]
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    expect(sortedParts).toEqual([
      { part: '脚',   daysAgo: 4 },
      { part: '胸',   daysAgo: 3 },
      { part: '背中', daysAgo: 2 }
    ])
  })

})