import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  'https://vpxncpcgokciivykhezc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweG5jcGNnb2tjaWl2eWtoZXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzYxMDc4OCwiZXhwIjoyMDg5MTg2Nzg4fQ.MQUa3x80eny3FMSS1g4q5P3BLcdC5oWH6Okk3lY2_lM'
)

export async function POST(request: Request) {
  const { id, status } = await request.json()
  const completedDate = status === 'completed' ? new Date().toISOString().split('T')[0] : null

  await supabase.from('tasks').update({
    status,
    completed_date: completedDate,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}
