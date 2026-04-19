import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { experiments as experimentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Card, Spinner, Alert } from '../components/ui/index.jsx'
import { Button } from '../components/ui/Button'

export default function TeacherDashboard() {
  const { teacher } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    experimentsApi.dashboard()
      .then(setList)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const togglePublish = async (id) => {
    setToggling(id)
    try {
      const updated = await experimentsApi.togglePublish(id)
      setList(prev => prev.map(e => e.id === id ? { ...e, published: updated.published } : e))
    } catch (err) {
      setError(err.message)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary-dark">Dashboard</h1>
          <p className="text-mid text-sm mt-0.5">{teacher?.school_name}</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          + Upload experiment
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {loading && (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      )}

      {!loading && list.length === 0 && (
        <Card className="text-center py-16">
          <p className="text-mid text-sm mb-4">No experiments yet.</p>
          <Button onClick={() => navigate('/upload')}>Upload your first experiment</Button>
        </Card>
      )}

      <div className="space-y-3">
        {list.map(exp => (
          <div key={exp.id}
            className="bg-surface rounded-card border border-[#D4E5E8] shadow-card px-5 py-4
              flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant={exp.subject}>{exp.subject}</Badge>
                <Badge variant={exp.published ? 'published' : 'draft'}>
                  {exp.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="font-display font-semibold text-sm text-primary-dark truncate">{exp.title}</p>
              <p className="text-xs text-mid mt-0.5">{exp.session_count} student sessions</p>
            </div>

            <div className="flex gap-2 items-center shrink-0">
              <Button
                size="sm" variant="ghost"
                onClick={() => navigate(`/experiments/${exp.id}`)}
                className="btn-preview">
                Preview
              </Button>
              <Button
                size="sm"
                variant={exp.published ? 'secondary' : 'primary'}
                loading={toggling === exp.id}
                onClick={() => togglePublish(exp.id)}>
                {exp.published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
