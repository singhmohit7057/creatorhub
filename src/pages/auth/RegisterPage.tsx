import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Sparkles, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  confirm:   z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options:  { data: { full_name: data.full_name } },
    })
    if (error) { toast.error(error.message); return }
    toast.success('Account created! Welcome to Showkase.')
    navigate('/dashboard')
  }

  async function signUpWithGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { toast.error(error.message); setGoogleLoading(false) }
  }

  return (
    <>
      <Helmet>
        <title>Create Account — Showkase</title>
      </Helmet>
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-surface-900 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Showkase
              </Link>
              <h1 className="text-2xl font-bold text-surface-900">Create your portfolio</h1>
              <p className="text-surface-500 text-sm mt-1">Free forever · No credit card required</p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              loading={googleLoading}
              onClick={signUpWithGoogle}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            >
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirm?.message}
                {...register('confirm')}
              />

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                Create Free Account
              </Button>
            </form>

            <p className="text-center text-xs text-surface-400 mt-4">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-brand-600 hover:underline">Terms</Link> &{' '}
              <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
            </p>

            <p className="text-center text-sm text-surface-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
