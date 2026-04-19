import { useState, useCallback } from 'react'
import { tutor as tutorApi } from '../services/api'

export function useTutor(documentText, sessionToken) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = useCallback(async (question) => {
    if (!question.trim()) return
    setError(null)

    const userMsg = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { answer } = await tutorApi.ask(question, documentText, history, sessionToken)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [messages, documentText, sessionToken])

  const reset = () => setMessages([])

  return { messages, loading, error, ask, reset }
}
