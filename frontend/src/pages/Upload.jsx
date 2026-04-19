import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { upload as uploadApi } from '../services/api'
import { Button } from '../components/ui/Button'
import { Alert, Spinner } from '../components/ui/index.jsx'

const SUBJECTS = ['physics', 'chemistry']
const MAX_MB = 10
const ALLOWED = ['.pdf', '.png', '.jpg', '.jpeg', '.webp']

export default function Upload() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState('physics')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const onFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ALLOWED.includes(ext)) { setError(`File type not supported. Use: ${ALLOWED.join(', ')}`); return }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`File too large. Maximum ${MAX_MB}MB.`); return }
    setError(null)
    setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await uploadApi.document(file, subject)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-surface rounded-card shadow-card border border-[#D4E5E8] p-8">
          <div className="w-12 h-12 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display font-semibold text-xl text-primary-dark mb-1">
            {result.cache_hit ? 'Found in library!' : 'Experiment generated!'}
          </h2>
          <p className="text-mid text-sm mb-1">{result.title}</p>
          {result.cache_hit && (
            <p className="text-xs text-mid mb-4">This experiment was already in the library — served instantly.</p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => navigate(`/experiments/${result.experiment_id}`)}>
              Preview experiment
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-primary-dark">Upload experiment</h1>
        <p className="text-mid text-sm mt-1">
          Upload a KNEC experiment document. Bina will generate an interactive version automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-card shadow-card border border-[#D4E5E8] p-6 space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        {/* File drop zone */}
        <div>
          <label className="block text-sm font-medium text-primary-dark mb-1">Document</label>
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-mid rounded-card p-8 text-center cursor-pointer
              hover:border-primary hover:bg-bg transition-colors"
          >
            {file ? (
              <div>
                <p className="font-medium text-primary-dark text-sm">{file.name}</p>
                <p className="text-xs text-mid mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-mid">Click to select a file</p>
                <p className="text-xs text-mid mt-1">PDF or image, max {MAX_MB}MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept={ALLOWED.join(',')} onChange={onFileChange} className="hidden" />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-primary-dark mb-2">Subject</label>
          <div className="flex gap-3">
            {SUBJECTS.map(s => (
              <button
                key={s} type="button"
                onClick={() => setSubject(s)}
                className={`flex-1 py-2 rounded-btn text-sm font-medium capitalize border transition-colors
                  ${subject === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-primary-dark border-[#D4E5E8] hover:border-primary'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Generating experiment...' : 'Upload & generate'}
        </Button>

        {loading && (
          <p className="text-xs text-mid text-center">
            This takes 15–30 seconds on first upload. Hang tight.
          </p>
        )}
      </form>
    </div>
  )
}
