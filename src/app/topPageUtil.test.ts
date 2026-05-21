import { calculatePartDaysAgo } from './topPageUtil'
import { describe, it, expect } from 'vitest'

/*
 * 過去の全記録から各部位の最終トレーニング日を特定し、
 * 今日までの経過日数を計算して降順にソートしたリストを返す関数
 * 
 * 引数は以下
 * exercisesData :データ型:{ name: 文字型, category: 文字型 }
 * sets          :データ型:{ exercise: 文字型, date: 文字型 }
 * DatatodayStr  :文字型(yyyy-mm-dd)
 * 
*/
describe('calculatePartDaysAgo', () => {
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

    expect(sortedParts.map(p => p.part)).toEqual(['背中', '胸', '脚', '肩'])
    expect(sortedParts[0].daysAgo).toBe(7)
    expect(sortedParts[1].daysAgo).toBe(2)
    expect(sortedParts[2].daysAgo).toBe(1)
    expect(sortedParts[3].daysAgo).toBe(0)
  })

  it('種目やセットのデータが空の場合は、空の配列を返すこと', () => {
    const exercisesData: any[] = []
    const setsData: any[] = []
    const todayStr = '2024-01-10'

    const sortedParts = calculatePartDaysAgo(exercisesData, setsData, todayStr)

    expect(sortedParts).toEqual([])
  })

})