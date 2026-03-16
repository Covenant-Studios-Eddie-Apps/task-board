import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpxncpcgokciivykhezc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'

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

const EMOJI_OPTIONS = ['🙏', '👟', '🎮', '📊', '👤', '🔥', '💰', '🚀', '💡', '⚡', '🎯', '📈', '🛠', '🎨', '📱', '💻', '🌐', '⭐', '💎', '🎪', '🏆', '🎲', '🎭', '🎪']

async function getTasks() {
  const { data } = await supabase.from('tasks').select('*').order('company')
  return (data || []) as Task[]
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return (data || []) as Category[]
}

async function toggleTask(id: string, currentStatus: string) {
  'use server'
  const newStatus = currentStatus === 'active' ? 'completed' : 'active'
  const completedDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
  
  await supabase.from('tasks').update({ 
    status: newStatus, 
    completed_date: completedDate,
    updated_at: new Date().toISOString()
  }).eq('id', id)
}

async function addTask(formData: FormData) {
  'use server'
  const task = formData.get('task') as string
  const owner = formData.get('owner') as string
  const company = formData.get('company') as string
  
  if (!task || !owner || !company) return
  
  const id = `${company}_${owner}_${Date.now()}`
  
  await supabase.from('tasks').insert({
    id,
    task,
    owner,
    company,
    status: 'active',
    added_date: new Date().toISOString().split('T')[0]
  })
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
  
  await supabase.from('categories').insert({
    id,
    name,
    emoji,
    color: color || '#888888',
    sort_order: sortOrder
  })
}

async function deleteTask(id: string) {
  'use server'
  await supabase.from('tasks').delete().eq('id', id)
}

export default async function TaskBoard() {
  const tasks = await getTasks()
  const categories = await getCategories()
  
  const activeTasks = tasks.filter(t => t.status === 'active')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  
  const tasksByCompany: Record<string, Record<string, Task[]>> = {}
  categories.forEach(c => {
    tasksByCompany[c.id] = { ernesto: [], mau: [], both: [] }
  })
  
  activeTasks.forEach(t => {
    if (tasksByCompany[t.company]) {
      tasksByCompany[t.company][t.owner].push(t)
    }
  })

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <header className="bg-[#1a1a1a] py-4 px-6 rounded-lg mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">📋 COVENANT STUDIOS — TASK BOARD</h1>
        <span className="text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </header>

      {/* Add Task Form */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">➕ Add New Task</h2>
        <form action={addTask} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Task</label>
            <input 
              name="task" 
              placeholder="Enter task description..." 
              required
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:border-[#4A9EFF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Owner</label>
            <select 
              name="owner" 
              required
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:border-[#4A9EFF] focus:outline-none"
            >
              <option value="ernesto">Ernesto</option>
              <option value="mau">Mau</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select 
              name="company" 
              required
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:border-[#4A9EFF] focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit"
            className="bg-[#4A9EFF] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#3a8eef] transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Add Category Form */}
      <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">🏷️ Add New Category</h2>
        <form action={addCategory} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Emoji</label>
            <select 
              name="emoji" 
              required
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:border-[#4A9EFF] focus:outline-none text-xl"
            >
              {EMOJI_OPTIONS.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input 
              name="name" 
              placeholder="Category name..." 
              required
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white focus:border-[#4A9EFF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Color</label>
            <input 
              name="color" 
              type="color"
              defaultValue="#888888"
              className="w-14 h-10 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-1 py-1"
            />
          </div>
          <button 
            type="submit"
            className="bg-[#A855F7] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#9345e7] transition-colors"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(cat => {
          const companyTasks = tasksByCompany[cat.id]
          const hasTasks = companyTasks && (companyTasks.ernesto.length > 0 || companyTasks.mau.length > 0 || companyTasks.both.length > 0)
          if (!hasTasks) return null
          
          return (
            <div key={cat.id} className="bg-[#1a1a1a] rounded-xl overflow-hidden" style={{ border: `2px solid ${cat.color}` }}>
              <div className="py-3 px-4 flex items-center gap-2" style={{ backgroundColor: cat.color }}>
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="text-lg font-bold text-black">{cat.name}</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {(['ernesto', 'mau', 'both'] as const).map(owner => {
                  const ownerTasks = companyTasks ? companyTasks[owner] : []
                  if (!ownerTasks || ownerTasks.length === 0) return null
                  
                  const ownerColor = owner === 'ernesto' ? '#FF6B35' : owner === 'mau' ? '#4A9EFF' : '#A855F7'
                  
                  return (
                    <div key={owner}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: ownerColor }}>
                        ▸ {owner.charAt(0).toUpperCase() + owner.slice(1)}
                      </h3>
                      <div className="space-y-1 ml-2">
                        {ownerTasks.map(task => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-8 bg-[#1a1a1a] rounded-xl overflow-hidden border-2 border-green-500">
          <div className="py-3 px-4 bg-green-500 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h2 className="text-lg font-bold text-black">COMPLETED</h2>
          </div>
          
          <div className="p-4">
            {(['ernesto', 'mau', 'both'] as const).map(owner => {
              const ownerTasks = completedTasks.filter(t => t.owner === owner)
              if (ownerTasks.length === 0) return null
              
              const ownerColor = owner === 'ernesto' ? '#FF6B35' : owner === 'mau' ? '#4A9EFF' : '#A855F7'
              
              return (
                <div key={owner} className="mb-4 last:mb-0">
                  <h3 className="text-sm font-bold mb-2" style={{ color: ownerColor }}>
                    ▸ {owner.charAt(0).toUpperCase() + owner.slice(1)}
                  </h3>
                  <div className="space-y-1 ml-2">
                    {ownerTasks.map(task => (
                      <div key={task.id} className="text-gray-500 line-through text-sm py-1 flex items-center gap-2">
                        <span>✓</span>
                        <span>{task.task}</span>
                        {task.completed_date && <span className="text-xs">({task.completed_date})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-2 group">
      <form action={async () => {
        'use server'
        await toggleTask(task.id, task.status)
      }}>
        <button type="submit" className="flex items-center gap-2 py-1 hover:text-green-400 transition-colors">
          <span className="text-gray-500 hover:text-green-400">○</span>
          <span className="text-sm">{task.task}</span>
        </button>
      </form>
      <form action={async () => {
        'use server'
        await deleteTask(task.id)
      }}>
        <button type="submit" className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
          🗑️
        </button>
      </form>
    </div>
  )
}
