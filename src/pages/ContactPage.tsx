import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Mail, MessageSquare, Sparkles, Send, Instagram, Twitter, Youtube, Clock } from 'lucide-react'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

const schema = z.object({
  name:    z.string().min(2, 'Name is required'),
  email:   z.string().email('Enter a valid email'),
  type:    z.string().min(1, 'Please select a topic'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

const CONTACT_TYPES = [
  { value: 'general',      label: 'General question' },
  { value: 'creator',      label: 'Creator support' },
  { value: 'brand',        label: 'Brand / partnership' },
  { value: 'bug',          label: 'Report a bug' },
  { value: 'feedback',     label: 'Product feedback' },
]

const info = [
  {
    icon: Mail,
    label: 'Email us',
    value: 'hello@showkase.io',
    href: 'mailto:hello@showkase.io',
  },
  {
    icon: MessageSquare,
    label: 'Feature request',
    value: 'Share your idea',
    href: '#form',
  },
  {
    icon: Sparkles,
    label: 'For brands',
    value: 'partnerships@showkase.io',
    href: 'mailto:partnerships@showkase.io',
  },
]

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(_data: FormData) {
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    toast.success('Message sent!')
  }

  return (
    <>
      <Helmet>
        <title>Contact — Showkase</title>
        <meta name="description" content="Get in touch with the Showkase team. We're here to help creators and brands." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 py-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-100/70 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-100/70 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Get in touch</h1>
          <p className="text-slate-500 text-lg">We'd love to hear from you — creators, brands, or just curious.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Left — info */}
          <div className="flex flex-col gap-4">
            {info.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 shrink-0 group-hover:bg-violet-100 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{item.value}</p>
                </div>
              </a>
            ))}

            {/* Social links */}
            <div className="flex-1 bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 border border-violet-100 rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Follow us</p>
              <a href="https://instagram.com/showkase" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 hover:border-violet-200 hover:shadow-sm transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Instagram</p>
                  <p className="text-xs text-slate-400">@showkase</p>
                </div>
              </a>
              <a href="https://twitter.com/showkase" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 hover:border-violet-200 hover:shadow-sm transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Twitter / X</p>
                  <p className="text-xs text-slate-400">@showkase</p>
                </div>
              </a>
              <a href="https://youtube.com/@showkase" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 hover:border-violet-200 hover:shadow-sm transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shrink-0">
                  <Youtube className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">YouTube</p>
                  <p className="text-xs text-slate-400">@showkase</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-2" id="form">
            {sent ? (
              <div className="h-full text-center flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-violet-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h2>
                <p className="text-slate-400 text-sm mb-6">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-violet-500 font-medium hover:text-violet-600"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="h-full bg-white border border-slate-100 rounded-2xl p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Your Name"
                    placeholder="Full name"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    required
                    {...register('email')}
                  />
                </div>
                <Select
                  label="Topic"
                  options={CONTACT_TYPES}
                  placeholder="What's this about?"
                  error={errors.type?.message}
                  {...register('type')}
                />
                <Textarea
                  label="Message"
                  placeholder="Tell us what's on your mind..."
                  rows={8}
                  error={errors.message?.message}
                  required
                  {...register('message')}
                />
                <Button type="submit" fullWidth size="lg" loading={isSubmitting} icon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                  <p className="text-sm text-slate-400">We reply within <span className="text-violet-500 font-medium">24 hours</span> on weekdays.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
