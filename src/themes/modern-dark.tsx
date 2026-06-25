import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Mail, Send, ExternalLink } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Input, Textarea, Select } from '@/components/common/Input'
import { BUDGET_OPTIONS, CREATOR_CATEGORIES, SERVICES } from '@/utils/constants'
import { formatNumber, cn } from '@/utils/helpers'
import { SOCIAL_COLORS, SOCIAL_TEXT, SOCIAL_ICONS, inquirySchema, type InquiryFormData, type ThemeProps, TopBar, isYTStats, getStatRows } from './_shared'

const CYAN = '#00f5d4'

export function ModernDarkTheme({ profile: p, socials, media, stats, collabs, testimonials, services, onInquiry, onSocialClick }: ThemeProps) {
  const [submitted, setSubmitted] = useState(false)
  const [showAllCollabs, setShowAllCollabs] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  })

  async function handleInquiry(data: InquiryFormData) {
    await onInquiry(data)
    setSubmitted(true)
    reset()
  }

  const categoryLabel = CREATOR_CATEGORIES.find(c => c.value === p.category)?.label

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-mono">
      <div className="max-w-[430px] mx-auto relative">
        <TopBar pageBg="#080c14" btnBg="rgba(0,245,212,0.15)" iconColor="#00f5d4" />

        {/* Hero */}
        <div className="relative px-5 pt-6 pb-8">
          {/* Glow blob */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%)' }} />

          {/* Avatar + name block */}
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${CYAN}, transparent)`, opacity: 0.6 }} />
              <Avatar src={p.avatar_url} name={p.full_name} size="2xl"
                className="relative rounded-2xl border-0" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">{p.full_name}</h1>
              {p.creator_title && (
                <p className="text-xs mt-1.5" style={{ color: CYAN }}>{p.creator_title}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {categoryLabel && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{ borderColor: CYAN, color: CYAN, background: 'rgba(0,245,212,0.06)' }}>
                    {categoryLabel}
                  </span>
                )}
                {(p.city || p.country) && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-2.5 h-2.5" />{[p.city, p.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {p.bio && (
            <p className="text-slate-400 text-xs leading-relaxed mt-5 border-l-2 border-slate-700 pl-3">
              {p.bio}
            </p>
          )}

          {/* Socials + contact */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            {socials.map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer"
                onClick={() => onSocialClick(p.id, s.platform)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: SOCIAL_COLORS[s.platform] ?? '#6366f1', color: SOCIAL_TEXT[s.platform] ?? 'white' }}>
                {SOCIAL_ICONS[s.platform]}
              </a>
            ))}
            {p.show_email && p.email && (
              <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#00f5d4] transition-colors ml-1">
                <Mail className="w-3 h-3" />{p.email}
              </a>
            )}
            {p.show_phone && p.phone && (
              <a href={`tel:${p.phone}`} className="text-[10px] text-slate-500 hover:text-[#00f5d4] transition-colors">
                📞 {p.phone}
              </a>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-slate-800" />

        {/* Body */}
        <div className="px-5 pb-6 space-y-12 mt-8">

          {/* Stats */}
          {stats && (isYTStats(stats) ? (stats.yt_followers || stats.yt_monthly_reach || stats.yt_avg_views || stats.yt_engagement_rate) : (stats.followers || stats.monthly_reach || stats.avg_views || stats.engagement_rate)) && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-slate-600 text-xs">{'// '}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>STATS</h2>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
                {getStatRows(stats).filter(s => s.value).map((s, i) => (
                  <div key={s.label} className={cn('bg-[#0d1220] p-4', i === 0 && 'rounded-tl-xl', i === 1 && 'rounded-tr-xl',
                    i === 2 && 'rounded-bl-xl', i === 3 && 'rounded-br-xl')}>
                    <p className="text-2xl font-bold tracking-tight" style={{ color: CYAN }}>
                      {formatNumber(s.value!)}{s.suffix}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-slate-600 text-xs">{'// '}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>SERVICES</h2>
              </div>
              <div className="space-y-2">
                {services.map(s => {
                  const svc = SERVICES.find(sv => sv.value === s.service_type)
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-slate-800/60">
                      <span className="text-base">{svc?.icon}</span>
                      <span className="text-sm text-slate-300 font-medium">{svc?.label ?? s.title}</span>
                      <span className="ml-auto text-slate-700 text-xs">→</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Media — horizontal scroll strip */}
          {media.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-slate-600 text-xs">{'// '}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>PORTFOLIO</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory scrollbar-none">
                {media.map(file => (
                  <div key={file.id} className="shrink-0 snap-start rounded-xl overflow-hidden"
                    style={{ width: '140px', aspectRatio: '9/16' }}>
                    {file.type === 'image'
                      ? <img src={file.url} alt={file.title ?? ''} className="w-full h-full object-cover" loading="lazy" />
                      : <video src={file.url} controls className="w-full h-full object-cover" />
                    }
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Collabs */}
          {collabs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-slate-600 text-xs">{'// '}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>BRAND COLLABS</h2>
              </div>
              <div className="space-y-2">
                {(showAllCollabs ? collabs : collabs.slice(0, 6)).map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-[#0d1220] border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors">
                    {c.brand_logo_url
                      ? <img src={c.brand_logo_url} alt={c.brand_name} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-slate-800" />
                      : <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-slate-400">{c.brand_name[0]}</span>
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{c.brand_name}</p>
                      {c.campaign_results && (
                        <p className="text-[10px] mt-0.5" style={{ color: CYAN }}>{c.campaign_results}</p>
                      )}
                    </div>
                    {c.content_type && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 uppercase shrink-0">
                        {c.content_type}
                      </span>
                    )}
                    {c.post_url && (
                      <a href={c.post_url} target="_blank" rel="noreferrer"
                        className="shrink-0 text-slate-600 hover:text-[#00f5d4] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {collabs.length > 6 && (
                <button onClick={() => setShowAllCollabs(v => !v)}
                  className="mt-3 w-full py-2 rounded-xl border border-slate-800 text-xs font-bold tracking-wider transition-colors hover:border-slate-600"
                  style={{ color: CYAN }}>
                  {showAllCollabs ? 'SHOW LESS ↑' : `+${collabs.length - 6} MORE BRANDS ↓`}
                </button>
              )}
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-slate-600 text-xs">{'// '}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>REVIEWS</h2>
              </div>
              <div className="space-y-4">
                {testimonials.map(tm => (
                  <div key={tm.id} className="bg-[#0d1220] border border-slate-800 rounded-xl p-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      <span style={{ color: CYAN }} className="font-bold mr-1">"</span>
                      {tm.review}
                      <span style={{ color: CYAN }} className="font-bold ml-1">"</span>
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                      <Avatar src={tm.avatar_url} name={tm.client_name} size="xs" className="rounded-lg" />
                      <div>
                        <p className="text-xs font-semibold text-white">{tm.client_name}</p>
                        {tm.company && <p className="text-[10px] text-slate-600">{tm.company}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-slate-600 text-xs">{'// '}</span>
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: CYAN }}>WORK WITH ME</h2>
            </div>
            {submitted ? (
              <div className="bg-[#0d1220] border border-slate-800 rounded-xl p-8 text-center">
                <p className="text-2xl mb-2" style={{ color: CYAN }}>✓</p>
                <p className="text-sm font-semibold text-white">Inquiry received.</p>
                <p className="text-xs text-slate-500 mt-1">{p.full_name} will reply soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-slate-600 hover:text-[#00f5d4] transition-colors">
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleInquiry)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Brand" placeholder="Your brand" error={errors.brand_name?.message} required {...register('brand_name')}
                    className="bg-[#0d1220] border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm" />
                  <Input label="Contact" placeholder="Your name" error={errors.contact_person?.message} required {...register('contact_person')}
                    className="bg-[#0d1220] border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm" />
                </div>
                <Input label="Email" type="email" placeholder="you@brand.com" error={errors.email?.message} required {...register('email')}
                  className="bg-[#0d1220] border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm" />
                <Select label="Budget" options={BUDGET_OPTIONS.map(b => ({ value: b, label: b }))} placeholder="Select range" {...register('budget')}
                  className="bg-[#0d1220] border-slate-700 text-white font-mono text-sm" />
                <Textarea label="Details" placeholder="Campaign, deliverables, timeline..." rows={3} error={errors.project_details?.message} required {...register('project_details')}
                  className="bg-[#0d1220] border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm" />
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: CYAN, color: '#080c14' }}>
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'SENDING...' : 'SEND INQUIRY'}
                </button>
              </form>
            )}
          </section>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-800">
            <Link to="/" className="text-[10px] text-slate-700 hover:text-[#00f5d4] transition-colors">
              Made with Showkase — Create yours free →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
