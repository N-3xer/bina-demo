import { useState } from 'react'
import { quiz as quizApi } from '../../services/api'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/index.jsx'

export function QuizModal({ questions, experimentId, sessionToken, onClose }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const allAnswered = answers.every(a => a !== null)

  const select = (qi, ai) => {
    if (result) return
    setAnswers(prev => { const next = [...prev]; next[qi] = ai; return next })
  }

  const submit = async () => {
    if (!allAnswered) return
    setLoading(true)
    setError(null)
    try {
      const res = await quizApi.submit(experimentId, answers, sessionToken)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface px-6 pt-6 pb-4 border-b border-[#D4E5E8]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display font-semibold text-lg text-primary-dark">Quick Quiz</h2>
              <p className="text-sm text-mid mt-0.5">Test your understanding of this experiment</p>
            </div>
            <button onClick={onClose} className="text-mid hover:text-primary-dark transition-colors text-xl leading-none">
              ×
            </button>
          </div>

          {result && (
            <div className={`mt-3 rounded-card px-4 py-3 text-sm font-medium
              ${result.percentage >= 60 ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-red-50 text-error'}`}>
              You scored {result.score}/{result.total} ({result.percentage}%)
              {result.percentage >= 60 ? ' — Well done!' : ' — Review the experiment and try again.'}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="px-6 py-4 space-y-6">
          {questions.map((q, qi) => {
            const feedback = result?.feedback[qi]
            return (
              <div key={qi}>
                <p className="text-sm font-medium text-primary-dark mb-3">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, ai) => {
                    const chosen = answers[qi] === ai
                    const isCorrect = feedback?.correct_index === ai
                    const isWrong = feedback && chosen && !isCorrect

                    let optClass = 'border border-[#D4E5E8] text-primary-dark hover:border-primary hover:bg-bg'
                    if (chosen && !result) optClass = 'border-primary bg-primary-light text-primary-dark'
                    if (result && isCorrect) optClass = 'border-success bg-[#E1F5EE] text-[#085041]'
                    if (result && isWrong) optClass = 'border-error bg-red-50 text-error'

                    return (
                      <button
                        key={ai}
                        onClick={() => select(qi, ai)}
                        className={`w-full text-left px-4 py-2.5 rounded-card text-sm transition-colors ${optClass}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {feedback && (
                  <p className="mt-2 text-xs text-mid italic">{feedback.explanation}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface px-6 py-4 border-t border-[#D4E5E8] flex justify-end gap-3">
          {error && <p className="text-xs text-error self-center">{error}</p>}
          {!result ? (
            <Button onClick={submit} disabled={!allAnswered} loading={loading}>
              Submit answers
            </Button>
          ) : (
            <Button onClick={onClose} variant="secondary">Close</Button>
          )}
        </div>
      </div>
    </div>
  )
}
