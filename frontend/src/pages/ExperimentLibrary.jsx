import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { experiments as experimentsApi } from '../services/api'
import { Card, Badge, Spinner, Alert } from '../components/ui/index.jsx'

export default function ExperimentLibrary() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    experimentsApi.list()
      .then(setList)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? list : list.filter(e => e.subject === filter)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-primary-dark">Experiment Library</h1>
        <p className="text-mid text-sm mt-1">Browse and run interactive science experiments</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'physics', 'chemistry'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
              ${filter === f
                ? 'bg-primary text-white'
                : 'bg-surface border border-[#D4E5E8] text-primary-dark hover:border-primary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-mid text-sm">No experiments found.</div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(exp => (
          <Card
            key={exp.id}
            onClick={() => navigate(`/experiments/${exp.id}`)}
            className="cursor-pointer hover:shadow-modal transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <Badge variant={exp.subject}>{exp.subject}</Badge>
            </div>
            <h3 className="font-display font-semibold text-primary-dark text-sm leading-snug">
              {exp.title}
            </h3>
            <p className="text-xs text-mid mt-2">Click to start experiment →</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
