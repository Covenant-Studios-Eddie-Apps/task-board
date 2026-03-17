'use client'

import { useState } from 'react'
import { Circle, Loader, CheckCircle2, Trash2, GripVertical, Plus } from 'lucide-react'
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

export default function Board({ initialTasks, categories }: { initialTasks: Task[]; categories: Category[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskOwner, setNewTaskOwner] = useState('ernesto')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'completed').length

  async function addTaskToCategory(category: string) {
    if (!newTaskText.trim()) return
    const id = `${category}_${newTaskOwner}_${Date.now()}`
    const newTask: Task = {
      id, task: newTaskText, owner: newTaskOwner, company: category,
      status: 'active', added_date: new Date().toISOString().split('T')[0], completed_date: null
    }
    setTasks(prev => [...prev, newTask])
    setNewTaskText('')
    setAddingTo(null)

    await fetch('/api/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ task: newTaskText, owner: newTaskOwner, company: category })
    })
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null } : t))
    await fetch('/api/update-task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: taskId, status: newStatus }) })
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
    const parts = (over.id as string).split('__')
    if (parts.length === 2) {
      const [, newStatus] = parts
      const task = tasks.find(t => t.id === active.id)
      if (task && task.status !== newStatus) updateTaskStatus(task.id, newStatus)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-[#1e1f25] text-white">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#1e1f25]">
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span>
            <div>
              <h1 className="text-sm font-semibold text-white">Covenant Studios</h1>
              <p className="text-[11px] text-white/40">{totalTasks} tasks · {doneTasks} done</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] text-white">E</div>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] text-white">M</div>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px]">🐱</div>
            </div>
            <span className="text-[11px] text-white/30">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Board */}
        <div className="flex overflow-x-auto gap-3 p-5 items-start" style={{ minHeight: 'calc(100vh - 57px)' }}>
          {categories.map(cat => {
            const catTasks = tasks.filter(t => t.company === cat.id)
            const todo = catTasks.filter(t => t.status === 'active')
            const doing = catTasks.filter(t => t.status === 'doing')
            const done = catTasks.filter(t => t.status === 'completed')

            return (
              <div key={cat.id} className="flex-shrink-0 w-[272px]">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-base">{cat.emoji}</span>
                  <h2 className="text-xs font-semibold text-white/80 uppercase tracking-wider">{cat.name}</h2>
                  <span className="text-[10px] text-white/30 ml-auto">{catTasks.length}</span>
                </div>

                {/* Column Body */}
                <div className="bg-[#282a32] rounded-xl p-2 space-y-3">
                  <DroppableSection id={`${cat.id}__active`} label="To do" icon="circle" tasks={todo} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} />
                  <DroppableSection id={`${cat.id}__doing`} label="In progress" icon="loader" tasks={doing} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} />
                  <DroppableSection id={`${cat.id}__completed`} label="Done" icon="check" tasks={done} selectedId={selectedId} onSelect={setSelectedId} onStatusChange={updateTaskStatus} onDelete={removeTask} isDone />

                  {/* Add a card */}
                  {addingTo === cat.id ? (
                    <div className="bg-[#1e1f25] rounded-lg p-2.5 border border-white/[0.08]">
                      <input
                        autoFocus
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addTaskToCategory(cat.id); if (e.key === 'Escape') { setAddingTo(null); setNewTaskText('') } }}
                        placeholder="Enter a title..."
                        className="w-full bg-transparent text-[13px] text-white placeholder-white/30 focus:outline-none mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={newTaskOwner}
                          onChange={e => setNewTaskOwner(e.target.value)}
                          className="bg-[#282a32] text-[11px] text-white/70 rounded px-2 py-1 border border-white/[0.06] focus:outline-none"
                        >
                          <option value="ernesto">Ernesto</option>
                          <option value="mau">Mau</option>
                          <option value="eddie">Eddie</option>
                          <option value="both">Both</option>
                        </select>
                        <button onClick={() => addTaskToCategory(cat.id)} className="bg-white text-black text-[11px] font-medium px-3 py-1 rounded hover:bg-white/90 transition-colors">
                          Add
                        </button>
                        <button onClick={() => { setAddingTo(null); setNewTaskText('') }} className="text-white/30 hover:text-white text-[11px] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingTo(cat.id); setNewTaskText(''); setNewTaskOwner('ernesto') }}
                      className="flex items-center gap-1.5 w-full px-2 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all text-[12px]"
                    >
                      <Plus size={14} className="text-white/30" strokeWidth={1.5} />
                      Add a card
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/30 text-sm">Click + to create your first category</p>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-[#282a32] rounded-lg px-3 py-2.5 border border-white/10 shadow-2xl w-[256px]">
            <p className="text-[12px] text-white">{activeTask.task}</p>
            <span className="text-[10px] text-white/40 uppercase">{activeTask.owner}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function DroppableSection({ id, label, icon, tasks, selectedId, onSelect, onStatusChange, onDelete, isDone = false }: {
  id: string; label: string; icon: string; tasks: Task[]; selectedId: string | null
  onSelect: (id: string | null) => void; onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void; isDone?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const IconComponent = icon === 'circle' ? Circle : icon === 'loader' ? Loader : CheckCircle2

  return (
    <div ref={setNodeRef} className={`transition-all rounded-lg ${isOver ? 'bg-white/[0.04] ring-1 ring-white/10' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <IconComponent size={12} className="text-white/50" strokeWidth={2} />
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{label}</span>
        {tasks.length > 0 && <span className="text-[10px] text-white/20 ml-auto">{tasks.length}</span>}
      </div>
      {tasks.length === 0 ? (
        <div className={`py-2.5 text-center rounded-lg border border-dashed transition-colors ${isOver ? 'border-white/20' : 'border-white/[0.06]'}`}>
          <p className="text-[10px] text-white/15">{isOver ? 'Drop here' : '—'}</p>
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
  task: Task; isDone?: boolean; isSelected: boolean
  onSelect: (id: string | null) => void; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void
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
          ? 'bg-white/[0.1] border-white/20 shadow-lg shadow-white/5'
          : isDone
            ? 'bg-[#1e1f25] border-white/[0.04] opacity-40 hover:opacity-60'
            : 'bg-[#1e1f25] border-white/[0.04] hover:border-white/10'
        }`}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing">
          <GripVertical size={12} className="text-white/15 hover:text-white/40 transition-colors" strokeWidth={2} />
        </div>
        <p className={`text-[13px] leading-relaxed flex-1 ${isDone ? 'line-through text-white/30' : isSelected ? 'text-white' : 'text-white/80'}`}>
          {task.task}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider flex items-center gap-1">
          <span>{ownerEmoji}</span> {task.owner}
        </span>

        <div className={`flex gap-0.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {task.status !== 'active' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'active') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip">
              <Circle size={11} className="text-white/50" strokeWidth={2} />
              <Tooltip text="To Do" />
            </button>
          )}
          {task.status !== 'doing' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'doing') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip">
              <Loader size={11} className="text-white/50" strokeWidth={2} />
              <Tooltip text="In Progress" />
            </button>
          )}
          {task.status !== 'completed' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(task.id, 'completed') }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors relative group/tip">
              <CheckCircle2 size={11} className="text-white/50" strokeWidth={2} />
              <Tooltip text="Done" />
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id) }} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 transition-colors relative group/tip">
            <Trash2 size={11} className="text-white/40" strokeWidth={2} />
            <Tooltip text="Delete" />
          </button>
        </div>
      </div>

      {isDone && task.completed_date && (
        <p className="text-[9px] text-white/20 mt-1">{task.completed_date}</p>
      )}
    </div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#1e1f25] text-[9px] text-white/80 rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none border border-white/10">
      {text}
    </span>
  )
}
