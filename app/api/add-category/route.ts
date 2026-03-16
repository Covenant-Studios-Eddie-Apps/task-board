import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabase = createClient(
  'https://vpxncpcgokciivykhezc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'
)

export async function POST(request: Request) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const emoji = formData.get('emoji') as string
  const color = formData.get('color') as string

  if (name && emoji) {
    const id = name.toLowerCase().replace(/\s+/g, '_')
    const { data } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
    const sortOrder = data && data[0] ? data[0].sort_order + 1 : 1
    await supabase.from('categories').insert({ id, name, emoji, color: color || '#888888', sort_order: sortOrder })
  }

  redirect('/')
}
