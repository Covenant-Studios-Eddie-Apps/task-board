import { createClient } from '@supabase/supabase-js'
import Board from './components/Board'
import FloatingButton from './components/FloatingButton'

const supabaseUrl = 'https://vpxncpcgokciivykhezc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getTasks() {
  const { data } = await supabase.from('tasks').select('*').order('created_at')
  return data || []
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

export default async function TaskBoard() {
  const tasks = await getTasks()
  const categories = await getCategories()

  return (
    <>
      <Board initialTasks={tasks} categories={categories} />
      <FloatingButton categories={categories.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))} />
    </>
  )
}
