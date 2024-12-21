import PlayerView from '@/app/components/PlayerView'

export default function PlayerPage({ params }: { params: { id: string; playerId: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Player</h1>
      <PlayerView quizId={params.id} playerId={params.playerId} />
    </div>
  )
}

