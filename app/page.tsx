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

const COMPANY_CONFIG: Record<string, { emoji: string; name: string; color: string }> = {
  prayer_lock: { emoji: '🙏', name: 'PRAYER LOCK', color: '#FF6B35' },
  step_lock: { emoji: '👟', name: 'STEP LOCK', color: '#4A9EFF' },
  ats: { emoji: '🎮', name: 'ATS', color: '#FACC15' },
  viewtrack: { emoji: '📊', name: 'VIEWTRACK', color: '#4ADE80' },
  personal: { emoji: '👤', name: 'PERSONAL', color: '#A855F7' },
}

const OWNER_CONFIG: Record<string, { label: string; color: string }> = {
  ernesto: { label: 'Ernesto', color: '#FF6B35' },
  mau: { label: 'Mau', color: '#4A9EFF' },
  both: { label: 'Both', color: '#A855F7' },
}

async function getTasks() {
  const { data } = await supabase.from('tasks').select('*').order('company')
  return data || []
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

export default async function TaskBoard() {
  const tasks = await getTasks()
  
  const activeTasks = tasks.filter((t: Task) => t.status === 'active')
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed')
  
  const tasksByCompany: Record<string, Record<string, Task[]>> = {}
  Object.keys(COMPANY_CONFIG).forEach(c => {
    tasksByCompany[c] = { ernesto: [], mau: [], both: [] }
  })
  
  activeTasks.forEach((t: Task) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(COMPANY_CONFIG).map(([company, config]) => {
          const companyTasks = tasksByCompany[company]
          const hasTasks = companyTasks.ernesto.length > 0 || companyTasks.mau.length > 0 || companyTasks.both.length > 0
          if (!hasTasks) return null
          
          return (
            <div key={company} className="bg-[#1a1a1a] rounded-xl overflow-hidden" style={{ border: `2px solid ${config.color}` }}>
              <div className="py-3 px-4 flex items-center gap-2" style={{ backgroundColor: config.color }}>
                <span className="text-xl">{config.emoji}</span>
                <h2 className="text-lg font-bold text-black">{config.name}</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {(['ernesto', 'mau', 'both'] as const).map(owner => {
                  const ownerTasks = companyTasks[owner]
                  if (ownerTasks.length === 0) return null
                  
                  return (
                    <div key={owner}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: OWNER_CONFIG[owner].color }}>
                        ▸ {OWNER_CONFIG[owner].label}
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
              const ownerTasks = completedTasks.filter((t: Task) => t.owner === owner)
              if (ownerTasks.length === 0) return null
              
              return (
                <div key={owner} className="mb-4 last:mb-0">
                  <h3 className="text-sm font-bold mb-2" style={{ color: OWNER_CONFIG[owner].color }}>
                    ▸ {OWNER_CONFIG[owner].label}
                  </h3>
                  <div className="space-y-1 ml-2">
                    {ownerTasks.map((task: Task) => (
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
    <form action={async () => {
      'use server'
      await toggleTask(task.id, task.status)
    }}>
      <button type="submit" className="w-full text-left flex items-center gap-2 py-1 hover:text-green-400 transition-colors group">
        <span className="text-gray-500 group-hover:text-green-400">○</span>
        <span className="text-sm">{task.task}</span>
      </button>
    </form>
  )
}
