'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/app/supabase-provider'

export default function CreateQuiz() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useSupabase()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .insert({
          title,
          status: 'waiting',
          current_question_index: 0,
          host_id: 'system' // In a real app, this would be the authenticated user's ID
        })
        .select()
        .single()

      if (error) throw error

      if (quiz) {
        // Create some sample questions
        const questions = [
          {
            quiz_id: quiz.id,
            question_text: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correct_option_index: 2,
            time_limit: 30
          },
          {
            quiz_id: quiz.id,
            question_text: 'Which planet is closest to the Sun?',
            options: ['Venus', 'Mars', 'Mercury', 'Jupiter'],
            correct_option_index: 2,
            time_limit: 30
          }
        ]

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questions)

        if (questionsError) throw questionsError

        toast({
          title: 'Quiz created successfully!',
          description: 'You will be redirected to the quiz page.'
        })

        router.push(`/quiz/${quiz.id}/organizer`)
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast({
        title: 'Error creating quiz',
        description: 'Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

