// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label,
  id,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  const base = 'card'
  const interactive = onClick ? 'cursor-pointer' : ''
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'badge-primary',
    physics: 'badge-physics',
    chemistry: 'badge-chemistry',
    published: 'badge-success',
    draft: 'badge',
  }
  return (
    <span className={`badge ${variants[variant] || variants.default}`}>
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <svg className={`animate-spin spinner ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ children, variant = 'error' }) {
  const variants = {
    error: 'alert-error',
    success: 'alert-success',
    info: 'alert',
  }
  return (
    <div className={`alert ${variants[variant]}`}>
      {children}
    </div>
  )
}
