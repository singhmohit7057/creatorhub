import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Camera, Mail, MapPin, User, Lock, Pencil, CheckCircle2, Circle, Eye, EyeOff, BadgeCheck, ShieldCheck, Link2, Copy, ExternalLink, CheckCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { profileService } from '@/services/profileService'
import { supabase } from '@/lib/supabase'
import { Input, Textarea, PasswordInput } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { SocialLinksCard } from '@/modules/dashboard/SocialLinksCard'
import { cn } from '@/utils/helpers'
import { APP_URL } from '@/utils/constants'
import type { CreatorCategory } from '@/types'

const CATEGORIES: { value: CreatorCategory; label: string }[] = [
  { value: 'fashion',    label: 'Fashion' },
  { value: 'beauty',     label: 'Beauty' },
  { value: 'lifestyle',  label: 'Lifestyle' },
  { value: 'travel',     label: 'Travel' },
  { value: 'food',       label: 'Food' },
  { value: 'fitness',    label: 'Fitness' },
  { value: 'tech',       label: 'Tech' },
  { value: 'gaming',     label: 'Gaming' },
  { value: 'education',  label: 'Education' },
  { value: 'finance',    label: 'Finance' },
  { value: 'parenting',  label: 'Parenting' },
  { value: 'other',      label: 'Other' },
]

const profileSchema = z.object({
  full_name:     z.string().min(2),
  creator_title: z.string().optional(),
  bio:           z.string().optional(),
  city:          z.string().optional(),
  country:       z.string().optional(),
  phone:         z.string().optional(),
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
  { label: 'At least 8 characters',    test: (v: string) => v.length >= 8 },
  { label: '1 uppercase letter',        test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 number',                  test: (v: string) => /[0-9]/.test(v) },
  { label: '1 special character',       test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

export function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [showPhone, setShowPhone]         = useState(profile?.show_phone ?? false)
  const [showEmail, setShowEmail]         = useState(profile?.show_email ?? true)
  const isVerified = profile?.is_verified ?? false
  const [verifyRequested, setVerifyRequested] = useState(false)
  const [isPublished, setIsPublished] = useState(profile?.is_published ?? false)
  const [publishing, setPublishing]   = useState(false)

  async function togglePublish() {
    if (!profile) return
    setPublishing(true)
    const next = !isPublished
    try {
      await profileService.update(profile.id, { is_published: next })
      setIsPublished(next)
      await refreshProfile()
      toast.success(next ? 'Portfolio is now live!' : 'Portfolio set to draft')
    } catch { toast.error('Failed to update') }
    finally { setPublishing(false) }
  }

  useEffect(() => {
    if (!profile) return
    supabase
      .from('verification_requests')
      .select('id, status')
      .eq('profile_id', profile.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setVerifyRequested(true) })
  }, [profile])

  async function requestVerification() {
    if (!profile) return
    try {
      const { error } = await supabase
        .from('verification_requests')
        .upsert({ profile_id: profile.id, status: 'pending', reason: '' }, { onConflict: 'profile_id' })
      if (error) throw error
      toast.success('Verification request sent!')
      setVerifyRequested(true)
    } catch { toast.error('Failed to send request') }
  }
  const [category, setCategory]           = useState<CreatorCategory | null>(profile?.category ?? null)
  const [usernameVal, setUsernameVal]         = useState(profile?.username ?? '')
  const [usernameEditing, setUsernameEditing] = useState(!profile?.username_claimed)
  const [usernameSaving, setUsernameSaving]   = useState(false)
  const [copied, setCopied]                   = useState(false)
  const [availability, setAvailability]       = useState<'idle' | 'checking' | 'available' | 'taken' | 'same'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullUrl = `${APP_URL}/${usernameVal || ''}`

  function handleUsernameInput(val: string) {
    const slug = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsernameVal(slug)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (slug === profile?.username) { setAvailability('same'); return }
    setAvailability('idle')
    if (!slug || slug.length < 3) return
    setAvailability('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', slug)
          .maybeSingle()
        setAvailability(data ? 'taken' : 'available')
      } catch { setAvailability('idle') }
    }, 500)
  }

  async function saveUsername() {
    if (!profile) return
    const slug = usernameVal.trim()
    if (!slug || (availability !== 'available' && availability !== 'same')) return
    if (slug === profile.username && profile.username_claimed) { setUsernameEditing(false); return }
    setUsernameSaving(true)
    try {
      await profileService.update(profile.id, { username: slug, username_claimed: true })
      await refreshProfile()
      setUsernameEditing(false)
      toast.success('Username claimed!')
    } catch { toast.error('Username already taken or invalid') }
    finally { setUsernameSaving(false) }
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  function copyLink() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => fallbackCopy())
    } else {
      fallbackCopy()
    }
  }

  function fallbackCopy() {
    const el = document.createElement('textarea')
    el.value = fullUrl
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name:     profile?.full_name     ?? '',
      creator_title: profile?.creator_title ?? '',
      bio:           profile?.bio           ?? '',
      city:          profile?.city          ?? '',
      country:       profile?.country       ?? '',
      phone:         profile?.phone         ?? '',
    },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  const newPwd = passwordForm.watch('new_password') ?? ''

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function saveProfile(data: ProfileForm) {
    if (!profile || !user) return
    const patch = { ...data, show_phone: showPhone, show_email: showEmail, category }
    try {
      let avatar_url = profile.avatar_url
      if (avatarFile) avatar_url = await profileService.uploadAvatar(user.id, avatarFile)
      await profileService.update(profile.id, { ...patch, avatar_url })
      await refreshProfile()
      toast.success('Profile saved!')
    } catch { toast.error('Failed to save') }
  }

  async function changePassword(data: PasswordForm) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: data.current_password,
    })
    if (signInError) {
      passwordForm.setError('current_password', { message: 'Current password is incorrect' })
      return
    }
    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) { toast.error(error.message); return }
    toast.success('Password updated!')
    passwordForm.reset()
  }

  return (
    <>
      <Helmet><title>Settings — Showkase</title></Helmet>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Settings</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage your account and profile details</p>
        </div>

        {/* Publish toggle */}
        <div className={cn(
          'rounded-2xl border p-4 flex items-center justify-between gap-4',
          isPublished ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-surface-200',
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
              isPublished ? 'bg-emerald-100' : 'bg-surface-100',
            )}>
              <ExternalLink className={cn('w-4 h-4', isPublished ? 'text-emerald-600' : 'text-surface-400')} />
            </div>
            <div>
              <p className={cn('text-sm font-semibold', isPublished ? 'text-emerald-800' : 'text-surface-700')}>
                {isPublished ? 'Portfolio is Live' : 'Portfolio is Draft'}
              </p>
              <p className={cn('text-xs mt-0.5', isPublished ? 'text-emerald-600' : 'text-surface-400')}>
                {isPublished
                  ? `Visible at ${APP_URL}/${profile?.username}`
                  : 'Only you can see it — publish to go live'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePublish}
            disabled={publishing}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
              isPublished
                ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                : 'bg-brand-600 border-brand-600 text-white hover:bg-brand-700',
              publishing && 'opacity-60 cursor-not-allowed',
            )}
          >
            {publishing ? '...' : isPublished ? 'Unpublish' : 'Publish Portfolio'}
          </button>
        </div>

        {/* Portfolio URL card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4 text-brand-500" />
            <p className="text-sm font-semibold text-surface-900">Your Portfolio URL</p>
          </div>

          {!usernameEditing ? (
            /* Locked view — shows current username with Copy / View / Edit */
            <>
              <div className="flex items-stretch gap-2 flex-wrap">
                <div className="flex items-center flex-1 min-w-0 bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 gap-1">
                  <span className="text-sm text-surface-400 font-medium whitespace-nowrap shrink-0">showkase.io/</span>
                  <span className="text-sm font-semibold text-surface-900 truncate">{profile?.username}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={copyLink}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      copied
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'border-surface-200 text-surface-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50',
                    )}
                    title="Copy portfolio link"
                  >
                    {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                    title="Open portfolio"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  {!profile?.username_claimed && (
                    <button
                      type="button"
                      onClick={() => { setUsernameVal(profile?.username ?? ''); setAvailability('same'); setUsernameEditing(true) }}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                      title="Edit username"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-surface-400 mt-2">Only lowercase letters, numbers, and underscores.</p>
              {profile?.username_claimed && (
                <p className="text-xs text-amber-600 font-medium mt-1">Username is permanent and cannot be changed.</p>
              )}
            </>
          ) : (
            /* Edit / claim flow */
            <>
              <div className="flex items-stretch gap-2">
                <div className={cn(
                  'flex items-center flex-1 bg-surface-50 border rounded-xl overflow-hidden transition-all',
                  availability === 'available' || availability === 'same'
                    ? 'border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400' :
                  availability === 'taken'
                    ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400' :
                  'border-surface-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent',
                )}>
                  <Pencil className="w-3.5 h-3.5 text-surface-300 ml-3 shrink-0" />
                  <span className="px-1 text-sm text-surface-400 font-medium whitespace-nowrap shrink-0">showkase.io/</span>
                  <input
                    type="text"
                    value={usernameVal}
                    onChange={e => handleUsernameInput(e.target.value)}
                    placeholder="yourname"
                    maxLength={30}
                    autoFocus
                    className="flex-1 py-2.5 text-sm font-medium text-surface-900 bg-transparent outline-none min-w-0"
                  />
                  <span className="pr-3 shrink-0">
                    {availability === 'checking' && (
                      <span className="w-4 h-4 border-2 border-surface-300 border-t-brand-500 rounded-full inline-block animate-spin" />
                    )}
                    {(availability === 'available' || availability === 'same') && (
                      <CheckCheck className="w-4 h-4 text-emerald-500" />
                    )}
                    {availability === 'taken' && (
                      <span className="text-red-500 text-lg leading-none font-bold">✕</span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={saveUsername}
                  disabled={usernameSaving || (availability !== 'available' && availability !== 'same')}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {usernameSaving ? 'Saving…' : 'Save'}
                </button>
                {profile?.username && !profile.username_claimed && (
                  <button
                    type="button"
                    onClick={() => { setUsernameVal(profile.username); setAvailability('idle'); setUsernameEditing(false) }}
                    className="px-3 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-500 hover:bg-surface-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {availability === 'available' && (
                <p className="text-xs text-emerald-600 font-medium mt-2">✓ Available</p>
              )}
              {availability === 'same' && (
                <p className="text-xs text-emerald-600 font-medium mt-2">✓ This is your current username</p>
              )}
              {availability === 'taken' && (
                <p className="text-xs text-red-500 font-medium mt-2">✕ This username is already taken.</p>
              )}
              {(availability === 'idle' || availability === 'checking') && (
                <p className="text-xs text-surface-400 mt-2">Only lowercase letters, numbers, and underscores.</p>
              )}
            </>
          )}
        </div>

        {/* Profile card */}
        <form onSubmit={profileForm.handleSubmit(saveProfile)}>
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <div className="flex flex-col sm:grid sm:grid-cols-[160px_1fr] gap-6">
              {/* Left — avatar */}
              <div className="flex sm:flex-col items-center sm:justify-start gap-4 sm:gap-3 sm:pt-1">
                <div className="relative">
                  <Avatar src={avatarPreview} name={profile?.full_name} size="xl" />
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 shadow-md transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div className="text-center sm:text-center">
                  <p className="text-xs font-medium text-surface-600">Profile Photo</p>
                  <p className="text-xs text-surface-400 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
                </div>
              </div>

              {/* Right — fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-surface-500 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <Input error={profileForm.formState.errors.full_name?.message} {...profileForm.register('full_name')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">Creator Title</label>
                    <Input placeholder="UGC Creator · Fashion & Lifestyle" {...profileForm.register('creator_title')} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-500 mb-1 block">Bio</label>
                  <Textarea rows={2} {...profileForm.register('bio')} />
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-500 mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(prev => prev === c.value ? null : c.value)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                          category === c.value
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-surface-50 border-surface-200 text-surface-500 hover:border-brand-300 hover:text-brand-600',
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-surface-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> City
                    </label>
                    <Input {...profileForm.register('city')} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">Country</label>
                    <Input {...profileForm.register('country')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone + visibility */}
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">Phone</label>
                    <Input type="tel" placeholder="+91 98765 43210" {...profileForm.register('phone')} />
                    <button
                      type="button"
                      onClick={() => setShowPhone(v => !v)}
                      className={cn(
                        'mt-1.5 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                        showPhone
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'bg-surface-50 border-surface-200 text-surface-400 hover:border-surface-300',
                      )}
                    >
                      {showPhone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {showPhone ? 'Visible on portfolio' : 'Hidden on portfolio'}
                    </button>
                  </div>

                  {/* Email + visibility */}
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-1 block">Email</label>
                    <div className="flex items-center gap-2 bg-surface-50 rounded-xl px-3 py-2 border border-surface-200 text-sm text-surface-500">
                      <Mail className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                      {profile?.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmail(v => !v)}
                      className={cn(
                        'mt-1.5 flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all',
                        showEmail
                          ? 'bg-brand-50 border-brand-200 text-brand-600'
                          : 'bg-surface-50 border-surface-200 text-surface-400 hover:border-surface-300',
                      )}
                    >
                      {showEmail ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {showEmail ? 'Visible on portfolio' : 'Hidden on portfolio'}
                    </button>
                  </div>
                </div>

                {/* Verified badge — read-only, admin controlled */}
                <div className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3',
                  isVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-50 border-surface-200',
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      isVerified ? 'bg-emerald-100' : 'bg-surface-100',
                    )}>
                      {isVerified
                        ? <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        : <ShieldCheck className="w-4 h-4 text-surface-400" />
                      }
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold', isVerified ? 'text-emerald-800' : 'text-surface-600')}>
                        {isVerified ? 'Verified Creator' : 'Not Verified'}
                      </p>
                      <p className={cn('text-[10px]', isVerified ? 'text-emerald-600' : 'text-surface-400')}>
                        {isVerified ? 'Verified badge shown on your portfolio' : 'Verification is reviewed and granted by the Showkase team'}
                      </p>
                    </div>
                  </div>
                  {isVerified ? (
                    <div className="relative inline-flex h-5 w-9 shrink-0 rounded-full bg-emerald-500 cursor-not-allowed opacity-60">
                      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm translate-x-4 mt-0.5 ml-0" />
                    </div>
                  ) : verifyRequested ? (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      Requested
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestVerification}
                      className="text-[11px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      Request Verification
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-end">
              <Button type="submit" loading={profileForm.formState.isSubmitting}>Save Changes</Button>
            </div>
          </div>
        </form>

        {/* Social links card */}
        <SocialLinksCard />

        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-surface-200 p-5">
          <p className="text-sm font-semibold text-surface-900 flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-surface-400" /> Change Password
          </p>
          <form onSubmit={passwordForm.handleSubmit(changePassword)}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PasswordInput
                  label="Current Password"
                  error={passwordForm.formState.errors.current_password?.message}
                  {...passwordForm.register('current_password')}
                />
                <PasswordInput
                  label={<span>New Password <span className="text-red-400">*</span></span>}
                  error={passwordForm.formState.errors.new_password?.message}
                  {...passwordForm.register('new_password')}
                />
                <PasswordInput
                  label="Confirm Password"
                  error={passwordForm.formState.errors.confirm?.message}
                  {...passwordForm.register('confirm')}
                />
              </div>

              {/* Strength rules */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PWD_RULES.map(rule => {
                  const met = newPwd.length > 0 && rule.test(newPwd)
                  return (
                    <div key={rule.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      met
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-surface-50 border-surface-200 text-surface-400'
                    }`}>
                      {met
                        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        : <Circle className="w-3.5 h-3.5 shrink-0" />
                      }
                      {rule.label}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-100 flex justify-end">
              <Button type="submit" loading={passwordForm.formState.isSubmitting}>Update Password</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
