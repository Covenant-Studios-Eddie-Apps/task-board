import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import FloatingButton from './components/FloatingButton'
import { Circle, Loader, CheckCircle2, Trash2 } from 'lucide-react'

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

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'completed').length

  return (
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
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-base">{cat.emoji}</span>
                <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">{cat.name}</h2>
                <span className="text-[10px] text-white/20 ml-auto bg-white/5 px-1.5 py-0.5 rounded">{catTasks.length}</span>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-2.5 space-y-3 border border-white/[0.04]">
                <StatusSection label="To do" icon="circle" tasks={todo} />
                <StatusSection label="In progress" icon="loader" tasks={doing} />
                <StatusSection label="Done" icon="check" tasks={done} isDone />
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

      <FloatingButton categories={categories.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))} />
    </div>
  )
}

function StatusSection({ label, icon, tasks, isDone = false }: { label: string; icon: string; tasks: Task[]; isDone?: boolean }) {
  const IconComponent = icon === 'circle' ? Circle : icon === 'loader' ? Loader : CheckCircle2

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <IconComponent size={11} className="text-white/20" strokeWidth={1.5} />
        <span className="text-[10px] font-medium text-white/25 uppercase tracking-widest">{label}</span>
        {tasks.length > 0 && <span className="text-[10px] text-white/15 ml-auto">{tasks.length}</span>}
      </div>
      {tasks.length === 0 ? (
        <div className="py-2 text-center">
          <p className="text-[10px] text-white/10">—</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} isDone={isDone} />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, isDone }: { task: Task; isDone?: boolean }) {
  return (
    <div className={`bg-white/[0.03] rounded-lg px-3 py-2.5 group hover:bg-white/[0.06] transition-all border border-white/[0.04] ${isDone ? 'opacity-40' : ''}`}>
      <p className={`text-[12px] leading-relaxed ${isDone ? 'line-through text-white/30' : 'text-white/70'}`}>
        {task.task}
      </p>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">
          {task.owner}
        </span>

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'active' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'active') }}>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors" title="To Do">
                <Circle size={10} className="text-white/30" strokeWidth={1.5} />
              </button>
            </form>
          )}
          {task.status !== 'doing' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'doing') }}>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors" title="In Progress">
                <Loader size={10} className="text-white/30" strokeWidth={1.5} />
              </button>
            </form>
          )}
          {task.status !== 'completed' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'completed') }}>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors" title="Done">
                <CheckCircle2 size={10} className="text-white/30" strokeWidth={1.5} />
              </button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteTask(task.id) }}>
            <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 transition-colors" title="Delete">
              <Trash2 size={10} className="text-white/20" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>

      {isDone && task.completed_date && (
        <p className="text-[9px] text-white/15 mt-1">{task.completed_date}</p>
      )}
    </div>
  )
}
