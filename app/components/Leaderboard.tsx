'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Database } from '@/types/supabase'

type Player = Database['public']['Tables']['players']['Row']

interface LeaderboardProps {
  quizId: string
  currentPlayerId?: string
}

export default function Leaderboard({ quizId, currentPlayerId }: LeaderboardProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const supabase = useSupabase()

  useEffect(() => {
    // Initial fetch
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching players:', error)
      } else {
        setPlayers(data)
      }
    }

    fetchPlayers()

    // Set up realtime subscription
    const playersSubscription = supabase
      .channel('players_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'players', 
          filter: `quiz_id=eq.${quizId}` 
        },
        async (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => [...prev, payload.new as Player].sort((a, b) => b.score - a.score).slice(0, 10))
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(player => player.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => {
              const updated = prev.map(player => 
                player.id === payload.new.id ? payload.new as Player : player
              )
              return updated.sort((a, b) => b.score - a.score).slice(0, 10)
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersSubscription)
    }
  }, [quizId, supabase])

  return (
    <Card className="bg-green-100 dark:bg-green-800">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li 
              key={player.id} 
              className={`flex justify-between items-center p-2 rounded ${
                player.id === currentPlayerId ? 'bg-primary/10' : index % 2 === 0 ? 'bg-secondary/10' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold">{index + 1}.</span>
                <span>{player.name}</span>
                {player.id === currentPlayerId && (
                  <Badge variant="outline">You</Badge>
                )}
              </div>
              <span className="font-semibold">{player.score} points</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

