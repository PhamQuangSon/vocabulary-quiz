import OrganizerView from '@/app/components/OrganizerView'

export default function OrganizerPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Organizer</h1>
      <OrganizerView quizId={params.id} />
    </div>
  )
}

