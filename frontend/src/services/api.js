const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('bina_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email, password, school_name) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, school_name }) }),

  me: () => request('/api/auth/me'),
}

// ── Experiments ───────────────────────────────────────────────────────────────
export const experiments = {
  list: () => request('/api/experiments'),

  get: (id) => request(`/api/experiments/${id}`),

  togglePublish: (id) =>
    request(`/api/experiments/${id}/publish`, { method: 'PATCH' }),

  dashboard: () => request('/api/experiments/teacher/dashboard'),
}

// ── Upload ────────────────────────────────────────────────────────────────────
export const upload = {
  document: (file, subject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('subject', subject)
    const token = getToken()
    return fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(err.detail)
      }
      return res.json()
    })
  },
}

// ── Tutor ─────────────────────────────────────────────────────────────────────
export const tutor = {
  ask: (question, documentText, conversationHistory, sessionToken) =>
    request('/api/tutor', {
      method: 'POST',
      body: JSON.stringify({
        question,
        document_text: documentText,
        conversation_history: conversationHistory,
        session_token: sessionToken,
      }),
    }),
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const quiz = {
  startSession: (experimentId) =>
    request(`/api/quiz/session/start?experiment_id=${experimentId}`, { method: 'POST' }),

  submit: (experimentId, answers, sessionToken) =>
    request('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ experiment_id: experimentId, answers, session_token: sessionToken }),
    }),
}
