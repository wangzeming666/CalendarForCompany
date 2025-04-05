import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CalendarEvent } from '@/types/calendar'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])

  const addEvent = (event: CalendarEvent) => {
    events.value.push({ ...event, id: crypto.randomUUID() })
  }

  const updateEvent = (updated: CalendarEvent) => {
    const index = events.value.findIndex(e => e.id === updated.id)
    if (index !== -1) events.value[index] = { ...updated }
  }

  const deleteEvent = (id: string) => {
    events.value = events.value.filter(e => e.id !== id)
  }

  return { events, addEvent, updateEvent, deleteEvent }
})
