'use client'

import { useState } from 'react'
import { Plus, X, ListTodo, FolderPlus } from 'lucide-react'

interface Category {
  id: string
  name: string
  emoji: string
}

const EMOJI_OPTIONS = ['🙏', '👟', '🎮', '📊', '👤', '🔥', '💰', '🚀', '💡', '⚡', '🎯', '📈', '🛠', '🎨', '📱', '💻', '🌐', '⭐', '💎', '🏆', '🎲', '🎭', '📋', '🎪']

export default function FloatingButton({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'task' | 'category'>('task')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-all z-50 flex items-center justify-center"
      >
        <Plus size={20} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#161616] rounded-xl w-full max-w-md border border-white/5" onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-sm font-medium text-white/80">Create</h2>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex px-5 gap-1 mb-4">
              <button
                onClick={() => setTab('task')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === 'task' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <ListTodo size={13} /> Task
              </button>
              <button
                onClick={() => setTab('category')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === 'category' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <FolderPlus size={13} /> Category
              </button>
            </div>

            {tab === 'task' && (
              <form action="/api/add-task" method="POST" className="px-5 pb-5 space-y-3">
                <div>
                  <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Task</label>
                  <input
                    name="task"
                    placeholder="What needs to be done?"
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Owner</label>
                    <select name="owner" required className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none">
                      <option value="ernesto">Ernesto</option>
                      <option value="mau">Mau</option>
                      <option value="eddie">🐱 Eddie</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Category</label>
                    <select name="company" required className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm"
                >
                  Create Task
                </button>
              </form>
            )}

            {tab === 'category' && (
              <form action="/api/add-category" method="POST" className="px-5 pb-5 space-y-3">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <div>
                    <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Icon</label>
                    <select name="emoji" required className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-2.5 text-lg text-center focus:border-white/20 focus:outline-none">
                      {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Name</label>
                    <input
                      name="name"
                      placeholder="Category name..."
                      required
                      className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-white/30 mb-1 uppercase tracking-widest">Color</label>
                  <input name="color" type="color" defaultValue="#888888" className="w-full h-9 bg-white/5 border border-white/5 rounded-lg cursor-pointer" />
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm"
                >
                  Create Category
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
