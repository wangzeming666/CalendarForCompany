import type { CalendarEvent } from '@/types/calendar'

export const createEventAPI = async (event: CalendarEvent): Promise<CalendarEvent> => {
  console.log('[API] 创建事件：', event)
  return Promise.resolve({ ...event, id: crypto.randomUUID() })
}

export const updateEventAPI = async (event: CalendarEvent): Promise<void> => {
  console.log('[API] 更新事件：', event)
  return Promise.resolve()
}

export const deleteEventAPI = async (id: string): Promise<void> => {
  console.log('[API] 删除事件：', id)
  return Promise.resolve()
}
