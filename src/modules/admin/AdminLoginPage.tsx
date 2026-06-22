import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { ShieldCheck, Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setAuthError(null)

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)
    if (error) { setAuthError(error.message); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', authData.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setAuthError('You do not have admin access.')
      return
    }

    await refreshProfile()
    navigate('/admin', { replace: true })
  }

  return (
    <>
      <Helmet><title>Admin Login — Showkase</title></Helmet>
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0f0f1a 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-900/50">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Founder Panel</h1>
              <p className="text-sm text-white/40 mt-1">Restricted access — admins only</p>
            </div>

            {authError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="admin@showkase.io"
                    {...register('email')}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full pl-4 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-brand-900/40"
              >
                {isSubmitting ? 'Signing in…' : 'Sign In to Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
