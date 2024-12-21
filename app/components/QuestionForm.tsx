'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Trash2 } from 'lucide-react'

interface QuestionFormProps {
  quizId: string
  onQuestionAdded: () => void
}

export function QuestionForm({ quizId, onQuestionAdded }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null)
  const [timeLimit, setTimeLimit] = useState(30)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabase()
  const { toast } = useToast()

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
    if (correctOptionIndex === index) {
      setCorrectOptionIndex(null)
    } else if (correctOptionIndex !== null && correctOptionIndex > index) {
      setCorrectOptionIndex(correctOptionIndex - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (correctOptionIndex === null) {
      toast({
        title: 'Error',
        description: 'Please select a correct answer.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from('questions').insert({
        quiz_id: quizId,
        question_text: questionText,
        options,
        correct_answer: options[correctOptionIndex],
        time_limit: timeLimit,
      })

      if (error) throw error

      toast({
        title: 'Question added',
        description: 'The question has been added to the quiz.',
      })

      // Reset form
      setQuestionText('')
      setOptions(['', ''])
      setCorrectOptionIndex(null)
      setTimeLimit(30)

      onQuestionAdded()
    } catch (error) {
      console.error('Error adding question:', error)
      toast({
        title: 'Error',
        description: 'Failed to add the question. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="questionText">Question</Label>
        <Input
          id="questionText"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...options]
                newOptions[index] = e.target.value
                setOptions(newOptions)
              }}
              required
            />
            <Button
              type="button"
              variant={correctOptionIndex === index ? 'default' : 'outline'}
              className={`${correctOptionIndex === index ? "bg-gray-600 hover:bg-gray-900 text-white" : ""} `}
              onClick={() => setCorrectOptionIndex(index)}
            >
              Correct
            </Button>
            {options.length > 2 && (
              <Button type="button" variant="ghost" onClick={() => removeOption(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOption} className="bg-blue-500 hover:bg-blue-600 text-white mr-2">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>
      <div>
        <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
        <Input
          id="timeLimit"
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          min={5}
          max={300}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="bg-gray-600 hover:bg-gray-900 text-white">
        {loading ? 'Adding...' : 'Add Question'}
      </Button>
    </form>
  )
}
