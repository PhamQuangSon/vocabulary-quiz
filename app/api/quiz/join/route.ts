import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided')
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  const { quizId, playerName } = await req.json()

  if (!quizId || !playerName) {
    return NextResponse.json({ error: 'Quiz ID and player name are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('players')
    .insert({ quiz_id: quizId, name: playerName, score: 0 })
    .select()
    .single()

  if (error) {
    console.error('Error joining quiz:', error)
    return NextResponse.json({ error: 'Failed to join quiz' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export const dynamic = 'force-dynamic'

