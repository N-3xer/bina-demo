import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export function Navbar() {
  const { teacher, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="page-container flex items-center h-14 justify-between">
        <Link to="/" className="navbar-brand">
          Bina
        </Link>

        <div className="flex items-center gap-4">
          {teacher && (
            <Link to="/experiments" className="navbar-link">
              Experiments
            </Link>
          )}

          {teacher ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/upload" className="navbar-link">
                Upload
              </Link>
              <span className="text-xs navbar-link hidden sm:block">{teacher.school_name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="">
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="">
              Teacher login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
