import { describe, expect, it } from 'vitest'

import { groupVisitsByDate } from './group-visits'

const visit = (date: string, type: string, organizationName = '가온종합건진센터') => ({
  date,
  type,
  organizationName,
})

describe('groupVisitsByDate', () => {
  it('같은 날짜의 일반·구강을 한 줄로 묶는다', () => {
    const days = groupVisitsByDate([
      visit('2025-09-16', '일반'),
      visit('2025-09-16', '구강'),
      visit('2024-08-22', '일반'),
      visit('2024-08-22', '구강'),
    ])

    expect(days).toHaveLength(2)
    expect(days[0]).toEqual({
      date: '2025-09-16',
      types: ['일반', '구강'],
      organizationName: '가온종합건진센터',
    })
  })

  it('입력 순서를 유지한다 (최신순으로 들어오면 최신순으로 나간다)', () => {
    const days = groupVisitsByDate([visit('2025-09-16', '일반'), visit('2020-04-06', '일반')])

    expect(days.map((d) => d.date)).toEqual(['2025-09-16', '2020-04-06'])
  })

  it('한 건만 있는 날짜도 묶는다', () => {
    expect(groupVisitsByDate([visit('2025-09-16', '일반')])).toEqual([
      { date: '2025-09-16', types: ['일반'], organizationName: '가온종합건진센터' },
    ])
  })

  it('빈 목록', () => {
    expect(groupVisitsByDate([])).toEqual([])
  })
})
