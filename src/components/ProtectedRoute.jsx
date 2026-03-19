import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Loader() {
  return <div className="loading-center"><div className="spin" /></div>
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? children : <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? <Navigate to="/home" replace /> : children
}
