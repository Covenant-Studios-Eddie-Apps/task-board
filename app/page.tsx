import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import FloatingButton from './components/FloatingButton'

const supabaseUrl = 'https://vpxncpcgokciivykhezc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'

const supabase = createClient(supabaseUrl, supabaseKey)

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

const OWNER_COLORS: Record<string, string> = {
  ernesto: '#FF6B35',
  mau: '#4A9EFF',
  both: '#A855F7',
}

async function getTasks() {
  const { data } = await supabase.from('tasks').select('*').order('created_at')
  return (data || []) as Task[]
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return (data || []) as Category[]
}

async function setTaskStatus(id: string, newStatus: string) {
  'use server'
  const completedDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
  await supabase.from('tasks').update({
    status: newStatus,
    completed_date: completedDate,
    updated_at: new Date().toISOString()
  }).eq('id', id)
  revalidatePath('/')
}

async function deleteTask(id: string) {
  'use server'
  await supabase.from('tasks').delete().eq('id', id)
  revalidatePath('/')
}

export default async function TaskBoard() {
  const tasks = await getTasks()
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-[#13141f] text-white">
      {/* Header */}
      <header className="bg-[#1a1b2e] px-6 py-4 flex items-center justify-between border-b border-[#2a2d42]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A9EFF] to-[#A855F7] flex items-center justify-center text-sm">📋</div>
          <div>
            <h1 className="text-lg font-bold">Covenant Studios</h1>
            <p className="text-xs text-gray-500">Task Board</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center text-[10px] font-bold">E</div>
            <div className="w-6 h-6 rounded-full bg-[#4A9EFF] flex items-center justify-center text-[10px] font-bold">M</div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Board */}
      <div className="flex overflow-x-auto gap-5 p-6 items-start" style={{ minHeight: 'calc(100vh - 70px)' }}>
        {categories.map(cat => {
          const catTasks = tasks.filter(t => t.company === cat.id)
          const todo = catTasks.filter(t => t.status === 'active')
          const doing = catTasks.filter(t => t.status === 'doing')
          const done = catTasks.filter(t => t.status === 'completed')

          return (
            <div key={cat.id} className="flex-shrink-0 w-[300px]">
              {/* Column Header */}
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.emoji}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-sm">{cat.name}</h2>
                  <p className="text-[10px] text-gray-500">{catTasks.length} task{catTasks.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                  {catTasks.length}
                </div>
              </div>

              {/* Column Body */}
              <div className="bg-[#1a1b2e] rounded-2xl p-3 space-y-4 border border-[#2a2d42]">
                <StatusSection label="To Do" emoji="📝" tasks={todo} statusColor="#6B7280" />
                <StatusSection label="Doing" emoji="⚡" tasks={doing} statusColor="#FACC15" />
                <StatusSection label="Done" emoji="✅" tasks={done} statusColor="#4ADE80" isDone />
              </div>
            </div>
          )
        })}

        {/* Empty state if no categories */}
        {categories.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">No categories yet. Click + to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingButton categories={categories.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))} />
    </div>
  )
}

function StatusSection({ label, emoji, tasks, statusColor, isDone = false }: { label: string; emoji: string; tasks: Task[]; statusColor: string; isDone?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs">{emoji}</span>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: statusColor }}>{label}</h3>
        <span className="text-[10px] text-gray-600 ml-auto">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div className="border border-dashed border-[#2a2d42] rounded-xl py-3 text-center">
          <p className="text-[11px] text-gray-700">No tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} isDone={isDone} />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, isDone }: { task: Task; isDone?: boolean }) {
  const ownerColor = OWNER_COLORS[task.owner] || '#888'

  return (
    <div className={`bg-[#13141f] rounded-xl p-3 group hover:ring-1 hover:ring-[#4A9EFF]/50 transition-all border border-[#2a2d42] ${isDone ? 'opacity-50' : ''}`}>
      <p className={`text-[13px] leading-snug ${isDone ? 'line-through text-gray-600' : 'text-gray-200'}`}>
        {task.task}
      </p>

      <div className="flex items-center justify-between mt-2.5">
        <span
          className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide"
          style={{ backgroundColor: ownerColor + '18', color: ownerColor, border: `1px solid ${ownerColor}30` }}
        >
          {task.owner}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'active' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'active') }}>
              <button className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1b2e] hover:bg-gray-700 text-[10px] transition-colors" title="To Do">📝</button>
            </form>
          )}
          {task.status !== 'doing' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'doing') }}>
              <button className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1b2e] hover:bg-yellow-900 text-[10px] transition-colors" title="Doing">⚡</button>
            </form>
          )}
          {task.status !== 'completed' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'completed') }}>
              <button className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1b2e] hover:bg-green-900 text-[10px] transition-colors" title="Done">✅</button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteTask(task.id) }}>
            <button className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1b2e] hover:bg-red-900 text-[10px] transition-colors" title="Delete">🗑️</button>
          </form>
        </div>
      </div>

      {isDone && task.completed_date && (
        <p className="text-[10px] text-gray-700 mt-1.5">{task.completed_date}</p>
      )}
    </div>
  )
}
