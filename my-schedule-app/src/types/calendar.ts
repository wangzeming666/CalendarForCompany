export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  people: string[]
  device?: string
  details?: string
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  customDates?: string[] // 多日期支持
}
