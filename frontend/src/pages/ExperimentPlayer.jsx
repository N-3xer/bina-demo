import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useExperiment } from '../hooks/useExperiment'
import { ExperimentCanvas } from '../components/experiment/ExperimentCanvas'
import { TutorPanel } from '../components/experiment/TutorPanel'
import { QuizModal } from '../components/experiment/QuizModal'
import { Badge, Spinner, Alert } from '../components/ui/index.jsx'
import { Button } from '../components/ui/Button'

export default function ExperimentPlayer() {
  const { id } = useParams()
  const { experiment, sessionToken, loading, error } = useExperiment(id)
  const [showQuiz, setShowQuiz] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-mid">Loading experiment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Alert variant="error">{error}</Alert>
      </div>
    )
  }

  if (!experiment) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={experiment.subject}>{experiment.subject}</Badge>
          </div>
          <h1 className="font-display font-bold text-2xl text-primary-dark">{experiment.title}</h1>
        </div>
        <Button onClick={() => setShowQuiz(true)} variant="secondary">
          Take quiz
        </Button>
      </div>

      {/* Main layout: experiment canvas + tutor panel */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <ExperimentCanvas componentUrl={experiment.component_url} />

        <div className="h-[520px]">
          <TutorPanel
            documentText={experiment.document_text}
            sessionToken={sessionToken}
          />
        </div>
      </div>

      {/* Quiz modal */}
      {showQuiz && sessionToken && (
        <QuizModal
          questions={experiment.quiz}
          experimentId={experiment.id}
          sessionToken={sessionToken}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}
