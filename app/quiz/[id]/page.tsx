import Leaderboard from '@/app/components/Leaderboard'

export default function QuizPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quiz {params.id}</h1>
      <Leaderboard quizId={params.id} />
    </div>
  )
}

