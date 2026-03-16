import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabase = createClient(
  'https://vpxncpcgokciivykhezc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'
)

export async function POST(request: Request) {
  const formData = await request.formData()
  const task = formData.get('task') as string
  const owner = formData.get('owner') as string
  const company = formData.get('company') as string

  if (task && owner && company) {
    const id = `${company}_${owner}_${Date.now()}`
    await supabase.from('tasks').insert({
      id, task, owner, company,
      status: 'active',
      added_date: new Date().toISOString().split('T')[0]
    })
  }

  redirect('/')
}
