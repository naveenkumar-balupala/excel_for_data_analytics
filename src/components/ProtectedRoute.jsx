import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loader from './Loader'

// Role-based route guard.
// requiredRole: 'student' | 'admin'
export default function ProtectedRoute({ requiredRole, children }) {
  const { user, role, loading } = useAuth()

  if (loading) return <Loader message="Checking access…" />

  if (!user) {
    // Not logged in -> send to the appropriate login page.
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} replace />
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role -> bounce to their own area.
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
