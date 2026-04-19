import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ExperimentLibrary from './pages/ExperimentLibrary'
import ExperimentPlayer from './pages/ExperimentPlayer'
import Upload from './pages/Upload'
import TeacherDashboard from './pages/TeacherDashboard'

function ProtectedRoute({ children }) {
  const { teacher, loading } = useAuth()
  if (loading) return null
  if (!teacher) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/experiments" element={<ExperimentLibrary />} />
          <Route path="/experiments/:id" element={<ExperimentPlayer />} />
          <Route path="/upload" element={
            <ProtectedRoute><Upload /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
