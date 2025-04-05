let events: any[] = [
  {
    id: '1',
    title: '项目会议',
    start: '2025-04-04T10:00:00',
    end: '2025-04-04T11:00:00',
    backgroundColor: '#3b82f6'
  }
]

export function getEvents() {
  return [...events]
}

export function saveEvent(event: any) {
  if (!event.id) {
    event.id = Date.now().toString()
    events.push(event)
  } else {
    const idx = events.findIndex(e => e.id === event.id)
    if (idx !== -1) events[idx] = event
  }
}

export function deleteEvent(id: string) {
  events = events.filter(e => e.id !== id)
}
