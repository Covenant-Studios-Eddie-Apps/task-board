'use client'

import { useState } from 'react'

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
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#4A9EFF] to-[#A855F7] text-white text-2xl shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform z-50 flex items-center justify-center"
      >
        +
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#1e2030] rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 border border-[#2e3148]" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-bold text-white">Create New</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex px-5 gap-2 mb-4">
              <button
                onClick={() => setTab('task')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'task'
                    ? 'bg-[#4A9EFF] text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#292b3d] text-gray-400 hover:text-white'
                }`}
              >
                📝 Task
              </button>
              <button
                onClick={() => setTab('category')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'category'
                    ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                    : 'bg-[#292b3d] text-gray-400 hover:text-white'
                }`}
              >
                🏷️ Category
              </button>
            </div>

            {/* Task Form */}
            {tab === 'task' && (
              <form action="/api/add-task" method="POST" className="px-5 pb-5 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Task Description</label>
                  <input
                    name="task"
                    placeholder="What needs to be done?"
                    required
                    className="w-full bg-[#292b3d] border border-[#3a3d52] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#4A9EFF] focus:outline-none focus:ring-1 focus:ring-[#4A9EFF]/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Owner</label>
                    <select name="owner" required className="w-full bg-[#292b3d] border border-[#3a3d52] rounded-xl px-4 py-3 text-sm text-white focus:border-[#4A9EFF] focus:outline-none">
                      <option value="ernesto">🟠 Ernesto</option>
                      <option value="mau">🔵 Mau</option>
                      <option value="both">🟣 Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                    <select name="company" required className="w-full bg-[#292b3d] border border-[#3a3d52] rounded-xl px-4 py-3 text-sm text-white focus:border-[#4A9EFF] focus:outline-none">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#4A9EFF] to-[#3a8eef] text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all text-sm"
                >
                  Create Task
                </button>
              </form>
            )}

            {/* Category Form */}
            {tab === 'category' && (
              <form action="/api/add-category" method="POST" className="px-5 pb-5 space-y-3">
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Emoji</label>
                    <select name="emoji" required className="w-full bg-[#292b3d] border border-[#3a3d52] rounded-xl px-2 py-3 text-xl text-center focus:border-[#A855F7] focus:outline-none">
                      {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Name</label>
                    <input
                      name="name"
                      placeholder="Category name..."
                      required
                      className="w-full bg-[#292b3d] border border-[#3a3d52] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-[#A855F7] focus:outline-none focus:ring-1 focus:ring-[#A855F7]/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Color</label>
                  <input name="color" type="color" defaultValue="#888888" className="w-full h-10 bg-[#292b3d] border border-[#3a3d52] rounded-xl cursor-pointer" />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#A855F7] to-[#9345e7] text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all text-sm"
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
