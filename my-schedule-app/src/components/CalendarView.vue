<script>
// FullCalendar 插件导入
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'           // 月视图（方格）
import timeGridPlugin from '@fullcalendar/timegrid'         // 日、周视图（时间轴）
import multiMonthPlugin from '@fullcalendar/multimonth'     // 多月（年）视图
import interactionPlugin from '@fullcalendar/interaction'   // 拖拽、点击、拉伸
import EventDialog from './EventDialog.vue'                 // 弹窗组件
import jaLocale from '@fullcalendar/core/locales/ja'        // 日语语言包

// 模拟的后端接口方法
import { createEventAPI, updateEventAPI, deleteEventAPI } from '@/api/events'
import { mockEvents } from '@/mock/events' // 初始事件列表

export default {
  components: { FullCalendar, EventDialog },
  data() {
    return {
      // 控制弹窗显隐
      showDialog: false,

      // 当前选中的事件对象（用于编辑）
      selectedEvent: null,

      // 当前点击的时间（用于新建）
      selectedDate: '',

      // 事件列表（从 mock 数据初始化）
      events: [...mockEvents],

      // FullCalendar 配置项
      calendarOptions: {
        // 使用的插件（必须包含视图 + interaction）
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          multiMonthPlugin,
        ],

        // 加载日语语言
        locales: [jaLocale],
        locale: 'ja', // 设置界面为日语

        // 初始视图
        initialView: 'timeGridWeek',

        // 顶部工具栏配置
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth,multiMonthYear',
        },

        // 各视图专属配置
        views: {
          timeGridWeek: {
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
          },
          timeGridDay: {
            slotMinTime: '08:00:00',
            slotMaxTime: '20:00:00',
          },
          multiMonthYear: {
            type: 'multiMonth',
            duration: { months: 12 },
          },
        },

        // 事件来源
        events: mockEvents,

        // 启用交互
        editable: true,       // 拖拽/拉伸可编辑
        selectable: true,     // 允许点击空白区域
        dateClick: this.handleDateClick,     // 点击空白 ➜ 弹窗（新建）
        eventClick: this.handleEventClick,   // 点击事件 ➜ 弹窗（编辑）
        eventDrop: this.handleEventDrop,     // 拖动事件 ➜ 保存
        eventResize: this.handleEventResize, // 改变事件尺寸 ➜ 保存
      },
    }
  },

  watch: {
    // 当 event 或 visible 发生变化时，更新 form
    visible(val) {
      if (val) {
        if (this.event) {
          this.form = { ...this.event }
        } else {
          // 重置表单为空（新建）
          this.form = {
            id: '',
            title: '',
            start: this.date || '',
            end: this.date || '',
            backgroundColor: '#42b983',
            people: [],
            device: [],
            details: '',
            repeat: 'none',
            customDates: [],
          }
        }
      }
    }
  },

  methods: {
    // 点击空白区域时 ➜ 准备新建日程
    handleDateClick(info) {
      this.selectedDate = info.dateStr
      this.selectedEvent = null
      this.showDialog = true
    },

    // 点击已有事件时 ➜ 编辑弹窗
    handleEventClick(info) {
      this.selectedEvent = {
        ...info.event.extendedProps,   // 自定义字段（details、people、device 等）
        id: info.event.id,
        title: info.event.title,        // 标题（必须手动加）
        backgroundColor: info.event.backgroundColor, //  背景色（必须手动加）
        details: info.event.extendedProps.details,
        device: info.event.extendedProps.device,
        start: info.event.start.toISOString(),  //  起始时间
        end: info.event.end.toISOString(),      //  结束时间
      }

      this.selectedDate = ''
      this.showDialog = true
    },

    // 拖动事件后保存起止时间
    async handleEventDrop(info) {
      const updated = {
        ...info.event.extendedProps,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      }
      await updateEventAPI(updated)
      this.updateEventInList(updated)
    },

    // 拉伸事件后保存变更
    async handleEventResize(info) {
      const updated = {
        ...info.event.extendedProps,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      }
      await updateEventAPI(updated)
      this.updateEventInList(updated)
    },

    // 弹窗中点击“保存”按钮
    async handleSave(event) {
      if (event.id) {
        // 是编辑，直接更新该事件
        await updateEventAPI(event)
        this.updateEventInList(event)
      } else {
        // 是新建 ➜ 生成多个重复事件
        const generatedEvents = generateRepeatedEvents(event)

        for (const e of generatedEvents) {
          const created = await createEventAPI(e)
          this.events.push(created)
        }
      }

      this.updateCalendar()
      this.showDialog = false
    },

    // 删除事件
    async handleDelete(id) {
      await deleteEventAPI(id)
      this.events = this.events.filter(e => e.id !== id)
      this.updateCalendar()
      this.showDialog = false
    },

    // 更新事件数组中指定事件
    updateEventInList(updated) {
      this.events = this.events.map(e => (e.id === updated.id ? updated : e))
    },

    // 将事件列表更新到 calendarOptions
    updateCalendar() {
      this.calendarOptions.events = [...this.events]
    },
  },
}

// 生成重复事件函数
function generateRepeatedEvents(event) {
  const result = []
  const startTime = new Date(event.start)
  const endTime = new Date(event.end)
  const startTimeStr = startTime.toTimeString().slice(0, 8)
  const endTimeStr = endTime.toTimeString().slice(0, 8)

  const repeatCount = 10 // 可配置：生成多少次重复（你也可以给用户设置结束日期）

  if (event.repeat === 'daily') {
    for (let i = 0; i < repeatCount; i++) {
      const date = new Date(startTime)
      date.setDate(date.getDate() + i)
      const dStr = date.toISOString().slice(0, 10)
      result.push(createClone(event, dStr, startTimeStr, endTimeStr))
    }
  }

  else if (event.repeat === 'weekly') {
    for (let i = 0; i < repeatCount; i++) {
      const date = new Date(startTime)
      date.setDate(date.getDate() + i * 7)
      const dStr = date.toISOString().slice(0, 10)
      result.push(createClone(event, dStr, startTimeStr, endTimeStr))
    }
  }

  else if (event.repeat === 'monthly') {
    for (let i = 0; i < repeatCount; i++) {
      const date = new Date(startTime)
      date.setMonth(date.getMonth() + i)
      const dStr = date.toISOString().slice(0, 10)
      result.push(createClone(event, dStr, startTimeStr, endTimeStr))
    }
  }

  else if (event.repeat === 'custom' && Array.isArray(event.customDates)) {
    for (const dStr of event.customDates) {
      result.push(createClone(event, dStr, startTimeStr, endTimeStr))
    }
  }

  else {
    // 单次事件
    result.push({ ...event })
  }

  return result
}

// 👇 创建克隆事件
function createClone(event, dateStr, startTimeStr, endTimeStr) {
  return {
    ...event,
    id: '', // 让后端生成
    start: `${dateStr}T${startTimeStr}`,
    end: `${dateStr}T${endTimeStr}`,
    repeat: 'none',
    customDates: []
  }
}

</script>

<template>
  <div>
    <!-- 日历主视图 -->
    <FullCalendar :options="calendarOptions" />

    <!-- 弹出事件编辑/新建对话框 -->
    <EventDialog
      :visible="showDialog"
      :event="selectedEvent"
      :date="selectedDate"
      @submit="handleSave"
      @delete="handleDelete"
      @update:visible="showDialog = $event"
    />
  </div>
</template>
