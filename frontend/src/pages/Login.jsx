import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/index.jsx'
import { Alert } from '../components/ui/index.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', school_name: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.school_name.trim()) { setError('School name is required'); setLoading(false); return }
        await register(form.email, form.password, form.school_name)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-primary-dark">
            {mode === 'login' ? 'Teacher sign in' : 'Create teacher account'}
          </h1>
          <p className="text-sm text-mid mt-1">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-[#D4E5E8] p-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            id="email" label="Email address" type="email"
            value={form.email} onChange={set('email')}
            placeholder="teacher@school.ke" required
          />
          <Input
            id="password" label="Password" type="password"
            value={form.password} onChange={set('password')}
            placeholder="••••••••" required minLength={8}
          />
          {mode === 'register' && (
            <Input
              id="school" label="School name"
              value={form.school_name} onChange={set('school_name')}
              placeholder="Nairobi Secondary School" required
            />
          )}

          <Button type="submit" loading={loading} className="w-full">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-xs text-mid mt-4">
          Demo: demo@bina.ke / BinaDemo2026!
        </p>
      </div>
    </div>
  )
}
