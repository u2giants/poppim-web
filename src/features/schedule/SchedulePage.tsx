import { useState } from 'react'
import { SCHEDULE_TASKS, WAITING_TASKS, CATEGORY_COLORS, CATEGORY_ICONS, LICENSOR_META, type MockScheduleTask } from '@/lib/mockData'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { TASKS } from '@/lib/mockData'
import type { MockTask } from '@/lib/mockData'

const DAYS = [
  { key: 'Mon', label: 'Mon 9' },
  { key: 'Tue', label: 'Tue 10' },
  { key: 'Wed', label: 'Wed 11' },
  { key: 'Thu', label: 'Thu 12' },
  { key: 'Fri', label: 'Fri 13' },
]
const TODAY = 'Thu'

export function SchedulePage() {
  const [activeTask, setActiveTask] = useState<MockTask | null>(null)

  function openByScheduleTask(st: MockScheduleTask) {
    const found = TASKS.find((t) => t.title === st.title)
    if (found) setActiveTask(found)
  }

  return (
    <>
      <div className="flex h-full overflow-hidden">
        {/* Day columns */}
        <div className="flex flex-1 overflow-x-auto">
          {DAYS.map(({ key, label }) => {
            const isToday = key === TODAY
            const dayTasks = SCHEDULE_TASKS[key] ?? []
            return (
              <div
                key={key}
                className="flex min-w-[220px] flex-1 flex-col"
                style={{ borderRight: '1px solid #EAEEF5' }}
              >
                {/* Day header */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: '1px solid #EAEEF5' }}
                >
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: isToday ? '#0094FF' : '#1B2840' }}
                  >
                    {label}
                  </span>
                  {isToday && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: '#0094FF' }}
                    >
                      Today
                    </span>
                  )}
                  <span
                    className="ml-auto rounded px-1.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: '#F6F8FC', color: '#5A6883' }}
                  >
                    {dayTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex flex-col gap-2 overflow-y-auto p-3">
                  {dayTasks.map((task) => (
                    <ScheduleCard key={task.id} task={task} onOpen={openByScheduleTask} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Waiting list */}
        <div
          className="w-[300px] shrink-0 flex flex-col"
          style={{ borderLeft: '1px solid #EAEEF5' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid #EAEEF5' }}
          >
            <span className="text-[14px] font-bold" style={{ color: '#1B2840' }}>Waiting list</span>
            <span
              className="ml-auto rounded px-1.5 py-0.5 text-[11px] font-semibold"
              style={{ background: '#F6F8FC', color: '#5A6883' }}
            >
              {WAITING_TASKS.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-3">
            {WAITING_TASKS.map((task) => (
              <ScheduleCard key={task.id} task={task} onOpen={openByScheduleTask} />
            ))}
          </div>
        </div>
      </div>

      <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} />
    </>
  )
}

function ScheduleCard({
  task,
  onOpen,
}: {
  task: MockScheduleTask
  onOpen: (t: MockScheduleTask) => void
}) {
  const catColors = CATEGORY_COLORS[task.category]
  const licMeta = LICENSOR_META[task.licensor]

  return (
    <div
      onClick={() => onOpen(task)}
      className="cursor-pointer rounded-xl p-3 transition-all"
      style={{
        background: catColors?.bg ?? '#F6F8FC',
        border: `1px solid ${catColors?.bg ?? '#EAEEF5'}`,
        boxShadow: '0 1px 3px rgba(20,40,80,0.06)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px -8px rgba(20,40,80,0.22)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(20,40,80,0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div className="flex items-start gap-2">
        <div
          className="flex size-[26px] shrink-0 items-center justify-center rounded-lg"
          style={{ background: '#fff', opacity: 0.9 }}
        >
          <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[task.category]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug" style={{ color: '#1B2840' }}>
            {task.title}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {licMeta && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: licMeta.gradient }}
              >
                {licMeta.letter} {task.licensor}
              </span>
            )}
            <span className="text-[11px]" style={{ color: '#94A0B5' }}>{task.time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
