import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

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

const EMOJI_OPTIONS = ['🙏', '👟', '🎮', '📊', '👤', '🔥', '💰', '🚀', '💡', '⚡', '🎯', '📈', '🛠', '🎨', '📱', '💻', '🌐', '⭐', '💎', '🎪', '🏆', '🎲', '🎭']

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

async function addTask(formData: FormData) {
  'use server'
  const task = formData.get('task') as string
  const owner = formData.get('owner') as string
  const company = formData.get('company') as string
  if (!task || !owner || !company) return

  const id = `${company}_${owner}_${Date.now()}`
  await supabase.from('tasks').insert({
    id, task, owner, company,
    status: 'active',
    added_date: new Date().toISOString().split('T')[0]
  })
  revalidatePath('/')
}

async function addCategory(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const emoji = formData.get('emoji') as string
  const color = formData.get('color') as string
  if (!name || !emoji) return

  const id = name.toLowerCase().replace(/\s+/g, '_')
  const { data } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const sortOrder = data && data[0] ? data[0].sort_order + 1 : 1

  await supabase.from('categories').insert({ id, name, emoji, color: color || '#888888', sort_order: sortOrder })
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
    <div className="min-h-screen bg-[#1d1f2b] text-white">
      {/* Header */}
      <header className="bg-[#292b3d] px-6 py-3 flex items-center justify-between border-b border-[#3a3d52]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">📋 Covenant Studios</h1>
          <span className="text-sm text-gray-400 bg-[#1d1f2b] px-3 py-1 rounded-full">Board</span>
        </div>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </header>

      {/* Add Task Bar */}
      <div className="bg-[#292b3d] px-6 py-3 border-b border-[#3a3d52]">
        <form action={addTask} className="flex flex-wrap gap-2 items-center">
          <input
            name="task"
            placeholder="+ Add a task..."
            required
            className="flex-1 min-w-[180px] bg-[#1d1f2b] border border-[#3a3d52] rounded px-3 py-1.5 text-sm text-white focus:border-[#4A9EFF] focus:outline-none"
          />
          <select name="owner" required className="bg-[#1d1f2b] border border-[#3a3d52] rounded px-3 py-1.5 text-sm text-white">
            <option value="ernesto">Ernesto</option>
            <option value="mau">Mau</option>
            <option value="both">Both</option>
          </select>
          <select name="company" required className="bg-[#1d1f2b] border border-[#3a3d52] rounded px-3 py-1.5 text-sm text-white">
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-[#4A9EFF] text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#3a8eef] transition-colors">
            Add
          </button>
        </form>
      </div>

      {/* Add Category Bar */}
      <div className="bg-[#292b3d] px-6 py-2 border-b border-[#3a3d52]">
        <form action={addCategory} className="flex flex-wrap gap-2 items-center">
          <select name="emoji" required className="bg-[#1d1f2b] border border-[#3a3d52] rounded px-2 py-1.5 text-lg">
            {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input name="name" placeholder="New category name..." required className="bg-[#1d1f2b] border border-[#3a3d52] rounded px-3 py-1.5 text-sm text-white focus:border-[#A855F7] focus:outline-none" />
          <input name="color" type="color" defaultValue="#888888" className="w-8 h-8 bg-transparent border border-[#3a3d52] rounded cursor-pointer" />
          <button type="submit" className="bg-[#A855F7] text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#9345e7] transition-colors">
            + Category
          </button>
        </form>
      </div>

      {/* Board Columns */}
      <div className="flex overflow-x-auto gap-4 p-6 items-start" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {categories.map(cat => {
          const catTasks = tasks.filter(t => t.company === cat.id)
          const todo = catTasks.filter(t => t.status === 'active')
          const doing = catTasks.filter(t => t.status === 'doing')
          const done = catTasks.filter(t => t.status === 'completed')

          return (
            <div key={cat.id} className="flex-shrink-0 w-[280px] bg-[#292b3d] rounded-xl overflow-hidden" style={{ border: `1px solid ${cat.color}30` }}>
              {/* Column Header */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `2px solid ${cat.color}` }}>
                <span className="text-lg">{cat.emoji}</span>
                <h2 className="font-bold text-sm uppercase tracking-wide">{cat.name}</h2>
                <span className="ml-auto text-xs text-gray-500 bg-[#1d1f2b] px-2 py-0.5 rounded-full">{catTasks.length}</span>
              </div>

              <div className="p-3 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                {/* TO DO */}
                <StatusSection label="📝 To Do" tasks={todo} color="#9CA3AF" />
                
                {/* DOING */}
                <StatusSection label="🔨 Doing" tasks={doing} color="#FACC15" />
                
                {/* DONE */}
                <StatusSection label="✅ Done" tasks={done} color="#4ADE80" isDone />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusSection({ label, tasks, color, isDone = false }: { label: string; tasks: Task[]; color: string; isDone?: boolean }) {
  if (tasks.length === 0) return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>{label}</h3>
      <p className="text-xs text-gray-600 italic">No tasks</p>
    </div>
  )

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>{label}</h3>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} isDone={isDone} />
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, isDone }: { task: Task; isDone?: boolean }) {
  const ownerColor = OWNER_COLORS[task.owner] || '#888'

  return (
    <div className={`bg-[#1d1f2b] rounded-lg p-3 group hover:ring-1 hover:ring-[#4A9EFF] transition-all ${isDone ? 'opacity-60' : ''}`}>
      <p className={`text-sm ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>{task.task}</p>
      
      <div className="flex items-center justify-between mt-2">
        {/* Owner badge */}
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: ownerColor + '20', color: ownerColor }}
        >
          {task.owner}
        </span>

        {/* Status buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'active' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'active') }}>
              <button className="text-[10px] bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded" title="Move to To Do">📝</button>
            </form>
          )}
          {task.status !== 'doing' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'doing') }}>
              <button className="text-[10px] bg-yellow-900 hover:bg-yellow-800 px-2 py-0.5 rounded" title="Move to Doing">🔨</button>
            </form>
          )}
          {task.status !== 'completed' && (
            <form action={async () => { 'use server'; await setTaskStatus(task.id, 'completed') }}>
              <button className="text-[10px] bg-green-900 hover:bg-green-800 px-2 py-0.5 rounded" title="Mark Done">✅</button>
            </form>
          )}
          <form action={async () => { 'use server'; await deleteTask(task.id) }}>
            <button className="text-[10px] bg-red-900 hover:bg-red-800 px-2 py-0.5 rounded" title="Delete">🗑️</button>
          </form>
        </div>
      </div>

      {isDone && task.completed_date && (
        <p className="text-[10px] text-gray-600 mt-1">{task.completed_date}</p>
      )}
    </div>
  )
}
