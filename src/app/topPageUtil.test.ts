import { calculatePartDaysAgo } from './topPageUtil'
import { describe, it, expect } from 'vitest'

describe('calculatePartDaysAgo', () => {
  it('should sort parts by daysAgo in descending order', () => {
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
})
