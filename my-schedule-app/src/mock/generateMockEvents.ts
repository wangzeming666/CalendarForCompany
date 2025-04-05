import type { CalendarEvent } from '@/types/calendar'

// 可选的日文标题（会重复使用）
const titles = [
  'コードレビュー', 'デザインレビュー', 'チーム朝会', 'スプリント計画会議', '採用面談',
  '1on1ミーティング', 'UXワークショップ', '週次営業会議', 'マーケMTG', '定例報告会'
]

const detailsPool = [
  '今週の業務内容を確認します。',
  'プロジェクト進捗の共有を行います。',
  'クライアントからのフィードバックを確認。',
  '新機能の仕様を確認し、議論します。',
  '今後のタスクスケジュールを調整。',
  'チームメンバーとの問題点を洗い出し。',
  '改善提案についての意見交換。',
  'テスト結果のレビューと修正点の確認。',
  'リリース計画について最終確認します。',
  '採用候補者に関する内部ミーティング。',
]


// 可选的人名
const peoplePool = ['田中', '佐藤', '山田', '加藤', '鈴木', '中村', '渡辺', '伊藤']

// 可选的设备
const devices = ['会議室 A', '会議室 B', 'オンライン', 'プロジェクター', '会議室 C']

// 可选颜色（饱和/柔和）
const colors = [
  '#42b983', '#f56c6c', '#409EFF', '#67C23A', '#E6A23C',
  '#A45EE5', '#20C997', '#FF8C00', '#6C757D', '#FF69B4'
]

// 工具函数：生成随机整数
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

// 工具函数：随机抽取数组元素
const randomFrom = <T>(arr: T[]): T =>
  arr[randInt(0, arr.length - 1)]

// 工具函数：随机抽取多个人
const pickPeople = (): string[] => {
  const count = randInt(1, 3)
  const shuffled = [...peoplePool].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 主函数：生成 N 条事件数据
export function generateMockEvents(count = 200): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    // 日期 = 今天 + [0~6] 天
    const dayOffset = randInt(0, 6)
    const baseDate = new Date(now)
    baseDate.setDate(now.getDate() + dayOffset)

    const dateStr = baseDate.toISOString().slice(0, 10)

    // 开始时间（8:00~19:00）
    const hour = randInt(8, 18)
    const minute = randInt(0, 1) === 0 ? '00' : '30'

    const start = `${dateStr}T${hour.toString().padStart(2, '0')}:${minute}:00`

    // 时长：30 / 60 / 90 分钟
    const duration = randInt(1, 3) * 30
    const endDate = new Date(`${start}`)
    endDate.setMinutes(endDate.getMinutes() + duration)
    const end = endDate.toISOString()

    const event: CalendarEvent = {
      id: `mock-${i}`,
      title: randomFrom(titles),
      start,
      end,
      backgroundColor: randomFrom(colors),
      people: pickPeople(),
      device: randomFrom(devices),
      details: randomFrom(detailsPool),
      repeat: 'none',
      customDates: [],
    }

    events.push(event)
  }

  return events
}
