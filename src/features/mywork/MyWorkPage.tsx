import { useState } from 'react'
import { TASKS, STAGES, STAGE_COLORS, CATEGORY_ICONS, CATEGORY_COLORS, LICENSOR_META } from '@/lib/mockData'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import type { MockTask } from '@/lib/mockData'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight } from 'lucide-react'

const CURRENT_USER = { id: 'mr', name: 'Marco Ruiz' }

export function MyWorkPage() {
  const [activeTask, setActiveTask] = useState<MockTask | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const myTasks = TASKS.filter((t) => t.assignees.includes(CURRENT_USER.id))

  const groups = STAGES.map((stage) => ({
    stage,
    items: myTasks.filter((t) => t.stage === stage),
  })).filter((g) => g.items.length > 0)

  function toggleCollapse(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      <div className="h-full overflow-y-auto px-8 py-7">
        {/* Header */}
        <div className="mb-7">
          <h2
            className="font-extrabold"
            style={{ fontSize: 21, color: '#1B2840', letterSpacing: '-0.02em' }}
          >
            My work
          </h2>
          <p className="mt-1 text-[13.5px]" style={{ color: '#5A6883' }}>
            Tasks assigned to you · {CURRENT_USER.name} · {myTasks.length} open
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-4">
          {groups.map(({ stage, items }) => {
            const stageStyle = STAGE_COLORS[stage]
            const isCollapsed = collapsed.has(stage)

            return (
              <div
                key={stage}
                className="overflow-hidden rounded-xl"
                style={{ border: '1px solid #EAEEF5' }}
              >
                {/* Group header */}
                <div
                  className="flex cursor-pointer items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[#F6F8FC]"
                  style={{ background: '#F6F8FC', borderBottom: isCollapsed ? 'none' : '1px solid #EAEEF5' }}
                  onClick={() => toggleCollapse(stage)}
                >
                  <ChevronRight
                    className="size-4 transition-transform"
                    style={{ color: '#5A6883', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
                  />
                  <span
                    className="size-2 rounded-full"
                    style={{ background: stageStyle?.dot ?? '#94A0B5' }}
                  />
                  <span className="text-[13px] font-bold" style={{ color: '#1B2840' }}>{stage}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: '#EAEEF5', color: '#5A6883' }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Task rows */}
                {!isCollapsed && items.map((task) => (
                  <MyWorkRow key={task.id} task={task} onOpen={setActiveTask} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} />
    </>
  )
}

function MyWorkRow({ task, onOpen }: { task: MockTask; onOpen: (t: MockTask) => void }) {
  const catColors = CATEGORY_COLORS[task.category]
  const licMeta = LICENSOR_META[task.licensor]

  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F6F8FC]"
      style={{ borderBottom: '1px solid #EAEEF5' }}
      onClick={() => onOpen(task)}
    >
      <Checkbox className="shrink-0" onClick={(e) => e.stopPropagation()} />
      <div
        className="flex size-[24px] shrink-0 items-center justify-center rounded-lg text-sm"
        style={{ background: catColors?.bg ?? '#F6F8FC' }}
      >
        {CATEGORY_ICONS[task.category]}
      </div>
      <span className="flex-1 text-[13.5px] font-medium" style={{ color: '#1B2840' }}>{task.title}</span>
      {licMeta && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white"
          style={{ background: licMeta.gradient }}
        >
          {licMeta.letter} {task.licensor}
        </span>
      )}
      {task.time && (
        <span className="shrink-0 text-[12px]" style={{ color: '#94A0B5' }}>{task.time}</span>
      )}
    </div>
  )
}
