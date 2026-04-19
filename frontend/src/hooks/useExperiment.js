import { useState, useEffect } from 'react'
import { experiments as experimentsApi, quiz as quizApi } from '../services/api'

export function useExperiment(experimentId) {
  const [experiment, setExperiment] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!experimentId) return

    const load = async () => {
      try {
        setLoading(true)
        const [exp, { session_token }] = await Promise.all([
          experimentsApi.get(experimentId),
          quizApi.startSession(experimentId),
        ])
        setExperiment(exp)
        setSessionToken(session_token)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [experimentId])

  return { experiment, sessionToken, loading, error }
}
