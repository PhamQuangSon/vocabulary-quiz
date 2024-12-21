export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quiz_participants: {
        Row: {
          id: number
          user_id: string
          quiz_id: string
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          quiz_id: string
          score?: number
        }
        Update: {
          score?: number
        }
      }
      quizzes: {
        Row: {
          id: string
          created_at: string
          title: string
          status: 'waiting' | 'active' | 'finished'
          current_question_index: number
          host_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          status?: 'waiting' | 'active' | 'finished'
          current_question_index?: number
          host_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          status?: 'waiting' | 'active' | 'finished'
          current_question_index?: number
          host_id?: string
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          quiz_id: string
          score: number
          last_answer_time: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          quiz_id: string
          score?: number
          last_answer_time?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          quiz_id?: string
          score?: number
          last_answer_time?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          options: string[]
          correct_answer: string
          time_limit: number
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          options: string[]
          correct_answer: string
          time_limit: number
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          options?: string[]
          correct_answer?: string
          time_limit?: number
        }
      }
      answers: {
        Row: {
          id: string
          player_id: string
          question_id: string
          answer_text: string
          is_correct: boolean
          response_time: number
        }
        Insert: {
          id?: string
          player_id: string
          question_id: string
          answer_text: string
          is_correct: boolean
          response_time: number
        }
        Update: {
          id?: string
          player_id?: string
          question_id?: string
          answer_text?: string
          is_correct?: boolean
          response_time?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

