import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/common/Button'

export function NotFoundPage() {
  return (
    <>
      <Helmet><title>Page Not Found — Showkase</title></Helmet>
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-8xl font-bold text-surface-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
          <p className="text-surface-500 mb-8">The page you're looking for doesn't exist.</p>
          <Link to="/"><Button size="lg">Go Home</Button></Link>
        </div>
      </div>
    </>
  )
}
