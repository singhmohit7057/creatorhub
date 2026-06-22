import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Mail, Send, Quote, ExternalLink } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Input, Textarea, Select } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { BUDGET_OPTIONS, CREATOR_CATEGORIES, SERVICES } from '@/utils/constants'
import { formatNumber, cn } from '@/utils/helpers'
import { SOCIAL_COLORS, SOCIAL_TEXT, SOCIAL_ICONS, inquirySchema, type InquiryFormData, type ThemeProps, TopBar } from './_shared'

const t = {
  page:        'bg-[#fdf6f9] text-gray-900',
  text:        'text-gray-900',
  muted:       'text-gray-500',
  hero:        'bg-[#fdf6f9]',
  heroBorder:  'border-pink-100',
  card:        'bg-white',
  cardBorder:  'border-pink-100',
  badge:       'bg-pink-50',
  badgeText:   'text-pink-600',
  statValue:   'text-pink-500',
  sectionHead: 'text-gray-900',
  input:       'bg-white border-pink-200 text-gray-900 placeholder:text-gray-400',
  btn:         'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white',
  divider:     'border-pink-100',
}

export function FashionPremiumTheme({ profile: p, socials, media, stats, collabs, testimonials, services, onInquiry, onSocialClick }: ThemeProps) {
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
    <div className={cn('min-h-screen', t.page)}>
      <div className="max-w-[430px] mx-auto relative">
        <TopBar pageBg="#fdf6f9" btnBg="#ec4899" iconColor="white" />

        {/* Hero — full-width editorial */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/30 via-purple-900/20 to-transparent pointer-events-none" />
          {p.cover_url && (
            <div className="absolute inset-0 opacity-20">
              <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative max-w-4xl mx-auto px-6 pt-8 pb-12 text-center">
            <Avatar src={p.avatar_url} name={p.full_name} size="3xl"
              className="mx-auto border-4 border-pink-400/50 shadow-2xl mb-6" />
            <h1 className="text-4xl font-black tracking-tight mb-2">{p.full_name}</h1>
            {p.creator_title && (
              <p className="text-pink-400 text-lg font-medium mb-4">{p.creator_title}</p>
            )}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
              {categoryLabel && (
                <span className={cn('px-3 py-1 rounded-full text-sm font-semibold border', t.badge, t.badgeText, t.cardBorder)}>
                  {categoryLabel}
                </span>
              )}
              {(p.city || p.country) && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {[p.city, p.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
            {socials.length > 0 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {socials.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer"
                    onClick={() => onSocialClick(p.id, s.platform)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: SOCIAL_COLORS[s.platform] ?? '#6366f1', color: SOCIAL_TEXT[s.platform] ?? 'white' }}>
                    {SOCIAL_ICONS[s.platform]}
                  </a>
                ))}
              </div>
            )}
            {(p.show_email || p.show_phone) && (
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                {p.show_email && p.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors">
                    <Mail className="w-3.5 h-3.5" />{p.email}
                  </a>
                )}
                {p.show_phone && p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors">
                    <span className="w-3.5 h-3.5 text-center leading-none">📞</span>{p.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-4 pb-20 space-y-14 mt-6">

          {/* Bio */}
          {p.bio && (
            <p className={cn('text-center text-base leading-relaxed max-w-2xl mx-auto', t.muted)}>{p.bio}</p>
          )}

          {/* Stats */}
          {stats && (stats.followers || stats.monthly_reach || stats.avg_views || stats.engagement_rate) && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center tracking-widest uppercase text-gray-900">By The Numbers</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Followers',     value: stats.followers,       suffix: '',  icon: '👥' },
                  { label: 'Monthly Reach', value: stats.monthly_reach,   suffix: '',  icon: '📡' },
                  { label: 'Avg. Views',    value: stats.avg_views,       suffix: '',  icon: '▶️'  },
                  { label: 'Engagement',    value: stats.engagement_rate, suffix: '%', icon: '🔥' },
                ].filter(s => s.value).map(s => (
                  <div
                    key={s.label}
                    className={cn('rounded-2xl border p-4 flex flex-col gap-1 relative overflow-hidden', t.card, t.cardBorder)}
                    style={{ boxShadow: '0 0 0 1px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-violet-600/10 pointer-events-none" />
                    <span className="text-lg leading-none">{s.icon}</span>
                    <p className={cn('text-3xl font-extrabold tracking-tight mt-1', t.statValue)}>
                      {formatNumber(s.value!)}{s.suffix}
                    </p>
                    <p className={cn('text-xs font-medium', t.muted)}>{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center tracking-widest uppercase text-gray-900">Services</h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {services.map(s => {
                  const svc = SERVICES.find(sv => sv.value === s.service_type)
                  return (
                    <span key={s.id} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border', t.card, t.cardBorder, t.text)}>
                      {svc?.icon} {svc?.label ?? s.title}
                    </span>
                  )
                })}
              </div>
            </section>
          )}

          {/* Media */}
          {media.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center tracking-widest uppercase text-gray-900">Portfolio</h2>
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {media.map(file => (
                  <div key={file.id} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm">
                    {file.type === 'image'
                      ? <img src={file.url} alt={file.title ?? ''} className="w-full object-cover" loading="lazy" />
                      : <video src={file.url} controls className="w-full rounded-xl" />
                    }
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Collabs */}
          {collabs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center tracking-widest uppercase text-gray-900">Brand Collaborations</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
                {(showAllCollabs ? collabs : collabs.slice(0, 6)).map(c => (
                  <div key={c.id} className={cn('rounded-2xl border overflow-hidden shrink-0 snap-start shadow-sm', t.card, t.cardBorder)} style={{ width: '160px' }}>
                    <div className="w-full overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
                      {c.cover_image_url ? (
                        <img src={c.cover_image_url} alt={c.brand_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={cn('w-full h-full flex items-center justify-center', t.card)}>
                          {c.brand_logo_url
                            ? <img src={c.brand_logo_url} alt={c.brand_name} className="w-16 h-16 object-contain" />
                            : <span className={cn('text-3xl font-black', t.muted)}>{c.brand_name[0]}</span>
                          }
                        </div>
                      )}
                      {c.content_type && (
                        <span className={cn('absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                          c.content_type === 'reel' ? 'bg-violet-600 text-white' :
                          c.content_type === 'post' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white')}>
                          {c.content_type}
                        </span>
                      )}
                      {c.post_url && (
                        <a href={c.post_url} target="_blank" rel="noreferrer"
                          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="p-3 flex items-center gap-2">
                      {c.brand_logo_url && <img src={c.brand_logo_url} alt={c.brand_name} className="w-7 h-7 rounded-full object-cover shrink-0" />}
                      <div className="min-w-0">
                        <p className={cn('text-xs font-bold leading-tight', t.text)}>{c.brand_name}</p>
                        {c.campaign_results && <p className="text-[10px] text-emerald-500 font-medium mt-0.5">{c.campaign_results}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {/* +N more card */}
                {!showAllCollabs && collabs.length > 6 && (
                  <button onClick={() => setShowAllCollabs(true)}
                    className={cn('rounded-2xl border shrink-0 snap-start flex flex-col items-center justify-center gap-1 transition-colors hover:bg-pink-50', t.card, t.cardBorder)}
                    style={{ width: '160px', aspectRatio: '9/16' }}>
                    <span className="text-2xl font-black text-gray-900">+{collabs.length - 6}</span>
                    <span className="text-[10px] text-pink-500 font-semibold">more brands</span>
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-center tracking-widest uppercase text-gray-900">What Brands Say</h2>
              <div className={cn('grid gap-4', testimonials.length > 1 ? 'sm:grid-cols-2' : '')}>
                {testimonials.map(tm => (
                  <div key={tm.id} className={cn('rounded-2xl border p-5 shadow-sm', t.card, t.cardBorder)}>
                    <Quote className={cn('w-6 h-6 mb-3 opacity-30', t.muted)} />
                    <p className={cn('text-sm leading-relaxed italic mb-5', t.muted)}>"{tm.review}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar src={tm.avatar_url} name={tm.client_name} size="sm" />
                      <div>
                        <p className={cn('text-sm font-semibold', t.text)}>{tm.client_name}</p>
                        {tm.company && <p className={cn('text-xs', t.muted)}>{tm.company}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-2 text-center tracking-widest uppercase text-gray-900">Work With Me</h2>
            <p className={cn('text-sm mb-6 text-center', t.muted)}>Interested in a collaboration? Send me a message.</p>
            {submitted ? (
              <div className={cn('rounded-2xl border p-10 text-center shadow-sm', t.card, t.cardBorder)}>
                <div className="text-4xl mb-3">🎉</div>
                <h3 className={cn('font-semibold mb-1', t.text)}>Inquiry sent!</h3>
                <p className={cn('text-sm', t.muted)}>{p.full_name} will get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-pink-500 hover:text-pink-400">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleInquiry)} className={cn('rounded-2xl border p-6 space-y-4 shadow-sm', t.card, t.cardBorder)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Brand Name" placeholder="Your brand" error={errors.brand_name?.message} required {...register('brand_name')} className={t.input} />
                  <Input label="Your Name" placeholder="Contact person" error={errors.contact_person?.message} required {...register('contact_person')} className={t.input} />
                </div>
                <Input label="Email" type="email" placeholder="your@brand.com" error={errors.email?.message} required {...register('email')} className={t.input} />
                <Select label="Budget" options={BUDGET_OPTIONS.map(b => ({ value: b, label: b }))} placeholder="Select budget range" {...register('budget')} className={t.input} />
                <Textarea label="Project Details" placeholder="Tell me about the campaign..." rows={4} error={errors.project_details?.message} required {...register('project_details')} className={t.input} />
                <Button type="submit" size="lg" fullWidth loading={isSubmitting} icon={<Send className="w-4 h-4" />} className={t.btn}>
                  Send Inquiry
                </Button>
              </form>
            )}
          </section>

          {/* Footer */}
          <div className={cn('text-center pt-2 border-t', t.divider)}>
            <Link to="/" className={cn('text-xs hover:text-pink-500 transition-colors', t.muted)}>Powered by Showkase →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
