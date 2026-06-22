import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Mail, Send, ArrowUpRight } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Input, Textarea, Select } from '@/components/common/Input'
import { BUDGET_OPTIONS, CREATOR_CATEGORIES, SERVICES } from '@/utils/constants'
import { formatNumber, cn } from '@/utils/helpers'
import { SOCIAL_COLORS, SOCIAL_TEXT, SOCIAL_ICONS, inquirySchema, type InquiryFormData, type ThemeProps, TopBar } from './_shared'

export function CreativeGridTheme({ profile: p, socials, media, stats, collabs, testimonials, services, onInquiry, onSocialClick }: ThemeProps) {
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
    <div className="min-h-screen bg-[#fafaf8] text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-[430px] mx-auto">
        <TopBar pageBg="#fafaf8" btnBg="#111111" iconColor="white" />

        {/* Hero — split block: photo left, info right */}
        <div className="grid grid-cols-2 min-h-[300px]">

          {/* Left: avatar photo */}
          <div className="relative bg-gray-100 overflow-hidden">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar src={p.avatar_url} name={p.full_name} size="2xl" />
              </div>
            )}
          </div>

          {/* Right: info panel — light */}
          <div className="bg-[#fafaf8] p-5 flex flex-col justify-between border-b border-gray-100">
            <div>
              <p className="text-[9px] tracking-[0.25em] text-gray-400 uppercase mb-4">Portfolio</p>
              <h1 className="text-xl font-black leading-tight tracking-tight text-gray-900">{p.full_name}</h1>
              {p.creator_title && (
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{p.creator_title}</p>
              )}
              <div className="flex flex-col gap-1.5 mt-4">
                {categoryLabel && (
                  <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded w-fit">{categoryLabel}</span>
                )}
                {(p.city || p.country) && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin className="w-2.5 h-2.5" />{[p.city, p.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {(p.show_email || p.show_phone) && (
                  <div className="flex flex-col gap-1 mt-1">
                    {p.show_email && p.email && (
                      <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-900 transition-colors truncate">
                        <Mail className="w-2.5 h-2.5 shrink-0" />{p.email}
                      </a>
                    )}
                    {p.show_phone && p.phone && (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-900 transition-colors">
                        <span className="text-[9px]">📞</span>{p.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Socials at bottom */}
            <div className="flex gap-1.5 flex-wrap mt-4">
              {socials.map(s => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer"
                  onClick={() => onSocialClick(p.id, s.platform)}
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ background: SOCIAL_COLORS[s.platform] ?? '#6366f1', color: SOCIAL_TEXT[s.platform] ?? 'white' }}>
                  {SOCIAL_ICONS[s.platform]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bio strip */}
        {p.bio && (
          <div className="bg-white px-5 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">{p.bio}</p>
          </div>
        )}

        {/* Body */}
        <div className="px-5 pb-20 space-y-14 mt-8">

          {/* Stats — big number row */}
          {stats && (stats.followers || stats.monthly_reach || stats.avg_views || stats.engagement_rate) && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">By The Numbers</h2>
                <div className="h-px flex-1 bg-gray-200 mx-3 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Followers',     value: stats.followers,       suffix: '',  accent: 'bg-black' },
                  { label: 'Monthly Reach', value: stats.monthly_reach,   suffix: '',  accent: 'bg-gray-800' },
                  { label: 'Avg. Views',    value: stats.avg_views,       suffix: '',  accent: 'bg-gray-700' },
                  { label: 'Engagement',    value: stats.engagement_rate, suffix: '%', accent: 'bg-gray-600' },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} className="group">
                    <p className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                      {formatNumber(s.value!)}{s.suffix}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className={cn('w-5 h-0.5', s.accent)} />
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services — pill row */}
          {services.length > 0 && (
            <section>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Services</h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map(s => {
                  const svc = SERVICES.find(sv => sv.value === s.service_type)
                  return (
                    <span key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black text-white">
                      {svc?.icon} {svc?.label ?? s.title}
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          {/* Media — mixed masonry */}
          {media.length > 0 && (
            <section>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Work</h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {/* First item large, rest 2-col */}
              <div className="space-y-2">
                {media[0] && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                    {media[0].type === 'image'
                      ? <img src={media[0].url} alt={media[0].title ?? ''} className="w-full h-full object-cover" loading="lazy" />
                      : <video src={media[0].url} controls className="w-full h-full object-cover" />
                    }
                  </div>
                )}
                {media.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {media.slice(1).map(file => (
                      <div key={file.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        {file.type === 'image'
                          ? <img src={file.url} alt={file.title ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                          : <video src={file.url} controls className="w-full h-full object-cover" />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Collabs — editorial card grid */}
          {collabs.length > 0 && (
            <section>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Brand Collabs</h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(showAllCollabs ? collabs : collabs.slice(0, 6)).map((c, i) => (
                  <div key={c.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/4]">
                    {/* Background: cover image or gradient placeholder */}
                    {c.cover_image_url ? (
                      <img src={c.cover_image_url} alt={c.brand_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0"
                        style={{ background: i % 2 === 0 ? '#111' : '#e5e5e5' }} />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content type badge — top left */}
                    {c.content_type && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-black tracking-widest uppercase bg-white text-black px-2 py-0.5 rounded-sm">
                          {c.content_type}
                        </span>
                      </div>
                    )}

                    {/* External link — top right */}
                    {c.post_url && (
                      <a href={c.post_url} target="_blank" rel="noreferrer"
                        className="absolute top-3 right-3 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {/* Brand logo + name */}
                      <div className="flex items-center gap-2 mb-1">
                        {c.brand_logo_url && (
                          <img src={c.brand_logo_url} alt={c.brand_name}
                            className="w-5 h-5 rounded-full object-cover bg-white shrink-0" />
                        )}
                        <p className="text-sm font-black text-white leading-tight truncate">{c.brand_name}</p>
                      </div>
                      {c.campaign_results && (
                        <p className="text-[10px] text-white/60 leading-snug line-clamp-2">{c.campaign_results}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {collabs.length > 6 && (
                <button onClick={() => setShowAllCollabs(v => !v)}
                  className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 text-xs font-black tracking-widest uppercase text-gray-400 hover:border-black hover:text-black transition-colors">
                  {showAllCollabs ? 'Show Less ↑' : `+${collabs.length - 6} More Brands ↓`}
                </button>
              )}
            </section>
          )}

          {/* Testimonials — large pull quotes */}
          {testimonials.length > 0 && (
            <section>
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">What Brands Say</h2>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-6">
                {testimonials.map(tm => (
                  <div key={tm.id}>
                    <p className="text-2xl font-black leading-tight text-gray-900 tracking-tight">
                      "{tm.review}"
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-8 h-px bg-black" />
                      <Avatar src={tm.avatar_url} name={tm.client_name} size="xs" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{tm.client_name}</p>
                        {tm.company && <p className="text-[10px] text-gray-400">{tm.company}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Work With Me</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            {submitted ? (
              <div className="bg-black text-white rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-black text-lg">Inquiry sent.</p>
                <p className="text-sm text-gray-400 mt-1">{p.full_name} will reply soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-gray-500 hover:text-white transition-colors">Send another →</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleInquiry)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Brand Name" placeholder="Your brand" error={errors.brand_name?.message} required {...register('brand_name')} />
                  <Input label="Your Name" placeholder="Contact person" error={errors.contact_person?.message} required {...register('contact_person')} />
                </div>
                <Input label="Email" type="email" placeholder="your@brand.com" error={errors.email?.message} required {...register('email')} />
                <Select label="Budget" options={BUDGET_OPTIONS.map(b => ({ value: b, label: b }))} placeholder="Select budget range" {...register('budget')} />
                <Textarea label="Project Details" placeholder="Tell me about the campaign..." rows={4} error={errors.project_details?.message} required {...register('project_details')} />
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </section>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-gray-100">
            <Link to="/" className="text-[10px] text-gray-300 hover:text-black transition-colors">Powered by Showkase →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
