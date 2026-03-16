'use client'

import { useState } from 'react'
import { Circle, Loader, CheckCircle2, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

interface Task {
  id: string
  task: string
  owner: string
  company: string
  status: string
  added_date: string
  completed_date: string | null
}

interface Category {
  id: string
  name: string
  emoji: string
  color: string
  sort_order: number
}

const STATUS_ORDER = ['active', 'doing', 'completed'] as const

export default function Board({ initialTasks, categories }: { initialTasks: Task[]; categories: Category[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'completed').length

  async function updateTaskStatus(taskId: string, newStatus: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null } : t))

    await fetch('/api/update-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status: newStatus })
    })
  }

  async function removeTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    await fetch('/api/delete-task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: taskId }) })
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const overId = over.id as string
    // droppable id format: "category_status" e.g. "prayer_lock_doing"
    const parts = overId.split('__')
    if (parts.length === 2) {
      const [, newStatus] = parts
      const task = tasks.find(t => t.id === active.id)
      if (task && task.status !== newStatus) {
        updateTaskStatus(task.id, newStatus)
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span>
            <div>
              <h1 className="text-sm font-semibold text-white/90">Covenant Studios</h1>
              <p className="text-[11px] text-white/30">{totalTasks} tasks · {doneTasks} done</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] text-white/60">E</div>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] text-white/60">M</div>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] text-white/60">🐱</div>
            </div>
            <span className="text-[11px] text-white/20">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Board */}
        <div className="flex overflow-x-auto gap-4 p-5 items-start" style={{ minHeight: 'calc(100vh - 57px)' }}>
          {categories.map(cat => {
            const catTasks = tasks.filter(t => t.company === cat.id)
            const todo = catTasks.filter(t => t.status === 'active')
            const doing = catTasks.filter(t => t.status === 'doing')
            const done = catTasks.filter(t => t.status === 'completed')

            return (
              <div key={cat.id} className="flex-shrink-0 w-[280px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-base">{cat.emoji}</span>
                  <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">{cat.name}</h2>
                  <span className="text-[10px] text-white/20 ml-auto bg-white/5 px-1.5 py-0.5 rounded">{catTasks.length}</span>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-2.5 space-y-3 border border-white/[0.04]">
                  <DroppableSection id={`${cat.id}__active`} label="To do" icon="circle" tasks={todo} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} />
                  <DroppableSection id={`${cat.id}__doing`} label="In progress" icon="loader" tasks={doing} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} />
                  <DroppableSection id={`${cat.id}__completed`} label="Done" icon="check" tasks={done} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} isDone />
                </div>
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/20 text-sm">Click + to create your first category</p>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2.5 border border-white/20 shadow-2xl w-[260px]">
            <p className="text-[12px] text-white/90">{activeTask.task}</p>
            <span className="text-[10px] text-white/40 uppercase">{activeTask.owner}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function DroppableSection({ id, label, icon, tasks, selectedId, onSelect, onStatusChange, onDelete, isDone = false }: {
  id: string
  label: string
  icon: string
  tasks: Task[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  isDone?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const IconComponent = icon === 'circle' ? Circle : icon === 'loader' ? Loader : CheckCircle2

  return (
    <div ref={setNodeRef} className={`transition-all rounded-lg ${isOver ? 'bg-white/[0.05] ring-1 ring-white/10' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <IconComponent size={11} className="text-white/20" strokeWidth={1.5} />
        <span className="text-[10px] font-medium text-white/25 uppercase tracking-widest">{label}</span>
        {tasks.length > 0 && <span className="text-[10px] text-white/15 ml-auto">{tasks.length}</span>}
      </div>
      {tasks.length === 0 ? (
        <div className={`py-3 text-center rounded-lg border border-dashed transition-colors ${isOver ? 'border-white/20' : 'border-white/[0.04]'}`}>
          <p className="text-[10px] text-white/10">{isOver ? 'Drop here' : '—'}</p>
        </div>
      ) : (
        <div className="space-y-1 min-h-[20px]">
          {tasks.map(task => (
            <DraggableCard key={task.id} task={task} isDone={isDone} isSelected={selectedId === task.id} onSelect={onSelect} onStatusChange={onStatusChange} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function DraggableCard({ task, isDone, isSelected, onSelect, onStatusChange, onDelete }: {
  task: Task
  isDone?: boolean
  isSelected: boolean
  onSelect: (id: string | null) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  const ownerEmoji = task.owner === 'eddie' ? '🐱' : task.owner === 'ernesto' ? '🟠' : task.owner === 'mau' ? '🔵' : '🟣'

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(isSelected ? null : task.id)}
      className={`rounded-lg px-3 py-2.5 group transition-all border cursor-pointer
        ${isDragging ? 'opacity-30' : ''}
        ${isSelected
          ? 'bg-white/[0.08] border-white/20 shadow-lg shadow-white/5'
          : isDone
            ? 'bg-white/[0.02] border-white/[0.04] opacity-40 hover:opacity-60'
            : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.06]'
        }`}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing">
          <GripVertical size={12} className="text-white/10 hover:text-white/30 transition-colors" strokeWidth={1.5} />
        </div>
        <p className={`text-[12px] leading-relaxed flex-1 ${isDone ? 'line-through text-white/30' : isSelected ? 'text-white' : 'text-white/70'}`}>
          {task.task}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider flex items-center gap-1">
          <span>{ownerEmoji}</span> {task.owner}
        </span>

        <div className={`flex gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {task.status !== 'active' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'active') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip" title="Move to To Do">
              <Circle size={10} className="text-white/30" strokeWidth={1.5} />
              <Tooltip text="To Do" />
            </button>
          )}
          {task.status !== 'doing' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'doing') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip" title="Move to In Progress">
              <Loader size={10} className="text-white/30" strokeWidth={1.5} />
              <Tooltip text="In Progress" />
            </button>
          )}
          {task.status !== 'completed' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'completed') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip" title="Mark Done">
              <CheckCircle2 size={10} className="text-white/30" strokeWidth={1.5} />
              <Tooltip text="Done" />
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id) }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 transition-colors relative group/tip" title="Delete">
            <Trash2 size={10} className="text-white/20" strokeWidth={1.5} />
            <Tooltip text="Delete" />
          </button>
        </div>
      </div>

      {isDone && task.completed_date && (
        <p className="text-[9px] text-white/15 mt-1">{task.completed_date}</p>
      )}
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-white/10 backdrop-blur-lg text-[9px] text-white/80 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none border border-white/10">
      {text}
    </span>
  )
}
