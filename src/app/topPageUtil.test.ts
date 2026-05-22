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

  it('同一部位に対して複数の日付の記録が存在する場合、最も新しい日付の記録を採用して経過日数を計算すること', () => {
    const exercisesData = [
      { name: 'ダンベルフライ', category: '胸' },
      { name: 'ベンチプレス', category: '胸' }
    ]

    // 順序がバラバラな複数のセットデータを用意する
    const setsData = [
      { exercise: 'ダンベルフライ', date: '2024-01-05' }, // 胸: 5日前
      { exercise: 'ベンチプレス', date: '2024-01-08' },   // 胸: 2日前 (最新)
      { exercise: 'ダンベルフライ', date: '2024-01-03' }, // 胸: 7日前
    ]
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    // 最も新しい 2024-01-08 (2日前) が採用されていること
    expect(sortedParts).toEqual([
      { part: '胸', daysAgo: 2 }
    ])
  })
 
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

  it('種目マスタに定義されておらず、かつBIG3にも該当しない不明な種目のレコードは無視されること', () => {
    const exercisesData = [
      { name: 'ベンチプレス', category: '胸' }
    ]

    const setsData = [
      { exercise: 'ベンチプレス', date: '2024-01-08' }, // 胸: 2日前
      { exercise: '謎のトレーニング', date: '2024-01-01' }, // マスタなし・BIG3でもない
    ]
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    // 不明な種目がスキップされ、ベンチプレス（胸）のみ計算されること
    expect(sortedParts).toEqual([
      { part: '胸', daysAgo: 2 }
    ])
  })

  // === 異常系：明らかに不正な入力や操作に対し、エラーが適切に返されるか ===
  it('セットデータの「日付（date）」が欠損している、または無効な日付文字列である場合、そのレコードは無視されること', () => {
    const exercisesData = [
      { name: 'ベンチプレス', category: '胸' }
    ]

    const setsData = [
      { exercise: 'ベンチプレス', date: 'invalid-date' }, // 無効な日付
      { exercise: 'ベンチプレス', date: '' },             // 空文字
      { exercise: 'ベンチプレス' },                       // date欠損 (undefined)
      { exercise: 'ベンチプレス', date: '2024-01-08' },  // 正常データ (2日前)
    ]
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData as any, todayStr)

    // 無効な日付レコードがスキップされ、正常なレコードのみから経過日数が計算されていること
    expect(sortedParts).toEqual([
      { part: '胸', daysAgo: 2 }
    ])
  })

  it('セットデータの「種目（exercise）」が欠損している場合、そのレコードは無視されること', () => {
    const exercisesData = [
      { name: 'ベンチプレス', category: '胸' }
    ]

    const setsData = [
      { date: '2024-01-08' }, // exercise欠損 (undefined)
      { exercise: 'ベンチプレス', date: '2024-01-08' } // 正常 (2日前)
    ]
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData as any, todayStr)

    // 種目名がないレコードが安全に無視されること
    expect(sortedParts).toEqual([
      { part: '胸', daysAgo: 2 }
    ])
  })

  it('基準日（todayStr）が無効な日付文字列である場合、空の配列を返すこと', () => {
    const exercisesData = [
      { name: 'ベンチプレス', category: '胸' }
    ]
    const setsData = [
      { exercise: 'ベンチプレス', date: '2024-01-08' }
    ]
    const todayStr = 'invalid-today'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    expect(sortedParts).toEqual([])
  })
})