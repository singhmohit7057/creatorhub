import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user && !import.meta.env.VITE_PREVIEW_AUTH_PAGES) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
