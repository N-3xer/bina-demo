import { useState, useRef, useEffect } from 'react'
import { useTutor } from '../../hooks/useTutor'
import { Spinner } from '../ui/index.jsx'

export function TutorPanel({ documentText, sessionToken }) {
  const { messages, loading, error, ask } = useTutor(documentText, sessionToken)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    ask(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-surface rounded-card border border-[#D4E5E8] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#D4E5E8] bg-bg">
        <p className="text-sm font-medium text-primary-dark font-display">Ask Bina</p>
        <p className="text-xs text-mid">Questions answered using your experiment document</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-mid text-center mt-8">
            Ask a question about this experiment — try "What is happening at the cathode?" or "Why does the colour change?"
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-card px-3 py-2 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-primary-light text-primary-dark'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-primary-light rounded-card px-3 py-2">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        {error && (
          <p className="text-xs text-error text-center">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#D4E5E8] flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          maxLength={500}
          className="flex-1 h-9 px-3 text-sm rounded-input border border-mid
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
            bg-surface text-primary-dark placeholder:text-mid transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-9 px-3 bg-primary text-white text-sm rounded-btn
            hover:bg-primary-dark disabled:opacity-50 disabled:pointer-events-none
            transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
