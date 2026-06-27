import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'
import { LoadingSpinner } from '@/components/ui'

/**
 * Wraps protected routes. While auth state loads, shows a spinner.
 * If no user is authenticated, redirects to /login preserving the
 * intended destination so we can redirect back after login.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="စောင့်ပါ..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
