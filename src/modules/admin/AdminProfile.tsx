import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Camera, Mail, User, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/helpers'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email'),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type PasswordForm = z.infer<typeof passwordSchema>

const PWD_RULES = [
  { label: 'At least 8 characters',  test: (v: string) => v.length >= 8 },
  { label: '1 uppercase letter',      test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 number',                test: (v: string) => /[0-9]/.test(v) },
  { label: '1 special character',     test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

export function AdminProfile() {
  const { profile, refreshProfile } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [showNew, setShowNew]             = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      email:     profile?.email ?? '',
    },
  })

  const pwdForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  const newPwd  = pwdForm.watch('new_password') ?? ''

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function onSaveProfile(data: ProfileForm) {
    let avatar_url = profile?.avatar_url ?? null
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `avatars/${profile!.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (uploadErr) { toast.error('Avatar upload failed'); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      avatar_url = publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.full_name, avatar_url })
      .eq('id', profile!.id)

    if (error) { toast.error(error.message); return }

    if (data.email !== profile?.email) {
      const { error: emailErr } = await supabase.auth.updateUser({ email: data.email })
      if (emailErr) { toast.error(emailErr.message); return }
      toast.success('Confirmation email sent to new address')
    }

    await refreshProfile({ full_name: data.full_name, avatar_url })
    toast.success('Profile updated')
  }

  async function onChangePassword(data: PasswordForm) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    profile!.email,
      password: data.current_password,
    })
    if (signInErr) { pwdForm.setError('current_password', { message: 'Current password is incorrect' }); return }

    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) { toast.error(error.message); return }

    toast.success('Password changed successfully')
    pwdForm.reset()
  }

  return (
    <>
      <Helmet><title>My Profile — Admin</title></Helmet>
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-surface-900">My Profile</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage your admin account details</p>
        </div>

        {/* Avatar + name card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-sm font-semibold text-surface-900 mb-5">Account Info</h2>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <Avatar src={avatarPreview} name={profile?.full_name} size="xl" />
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-brand-700 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-surface-900">{profile?.full_name}</p>
              <p className="text-sm text-surface-500">{profile?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Admin</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  {...profileForm.register('full_name')}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              {profileForm.formState.errors.full_name && (
                <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  {...profileForm.register('email')}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
              </div>
              {profileForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-surface-500" />
            <h2 className="text-sm font-semibold text-surface-900">Change Password</h2>
          </div>

          <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...pwdForm.register('current_password')}
                className="w-full px-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              {pwdForm.formState.errors.current_password && (
                <p className="mt-1 text-xs text-red-500">{pwdForm.formState.errors.current_password.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...pwdForm.register('new_password')}
                  className="w-full px-4 pr-10 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Rules */}
              {newPwd.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {PWD_RULES.map(rule => (
                    <div key={rule.label} className={cn('flex items-center gap-1.5 text-xs', rule.test(newPwd) ? 'text-emerald-600' : 'text-surface-400')}>
                      {rule.test(newPwd)
                        ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                        : <Circle className="w-3 h-3 shrink-0" />
                      }
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-medium text-surface-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...pwdForm.register('confirm')}
                  className="w-full px-4 pr-10 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwdForm.formState.errors.confirm && (
                <p className="mt-1 text-xs text-red-500">{pwdForm.formState.errors.confirm.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwdForm.formState.isSubmitting}
                className="px-5 py-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {pwdForm.formState.isSubmitting ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account meta */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Account Details</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Role',       value: <span className="capitalize font-medium text-brand-700">{profile?.role}</span> },
              { label: 'Status',     value: <span className="capitalize font-medium text-emerald-600">{profile?.status}</span> },
              { label: 'Member since', value: new Date(profile?.created_at ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'User ID',    value: <span className="font-mono text-xs text-surface-400">{profile?.id}</span> },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                <dt className="text-surface-500">{item.label}</dt>
                <dd className="text-surface-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </>
  )
}
