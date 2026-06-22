import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Sparkles, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useState } from 'react'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/dashboard/settings`,
    })
    if (error) { toast.error(error.message); return }
    setSent(true)
  }

  return (
    <>
      <Helmet>
        <title>Reset Password — Showkase</title>
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
              <h1 className="text-2xl font-bold text-surface-900">Reset your password</h1>
              <p className="text-surface-500 text-sm mt-1">We'll send you a reset link</p>
            </div>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="font-semibold text-surface-900 mb-2">Check your email</h2>
                <p className="text-sm text-surface-500">We've sent a password reset link to your email address.</p>
                <Link to="/login" className="inline-block mt-6 text-sm font-medium text-brand-600 hover:text-brand-700">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-surface-500">
                  <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Back to sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
