import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Download, ExternalLink } from 'lucide-react'
import { profileService }       from '@/services/profileService'
import { socialService }        from '@/services/socialService'
import { statsService }         from '@/services/statsService'
import { collaborationService } from '@/services/collaborationService'
import { testimonialService }   from '@/services/testimonialService'
import { serviceService }       from '@/services/serviceService'
import { APP_URL, CREATOR_CATEGORIES, SERVICES } from '@/utils/constants'
import { formatNumber } from '@/utils/helpers'
import { Avatar } from '@/components/common/Avatar'
import type { Profile, PortfolioStats, BrandCollaboration, Testimonial, CreatorService } from '@/types'

export function PublicMediaKitPage() {
  const { username } = useParams<{ username: string }>()
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [,             setSocials]      = useState<unknown[]>([])
  const [stats,        setStats]        = useState<PortfolioStats | null>(null)
  const [collabs,      setCollabs]      = useState<BrandCollaboration[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [services,     setServices]     = useState<CreatorService[]>([])
  const [notFound,     setNotFound]     = useState(false)
  const kitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!username) return
    profileService.getByUsername(username)
      .then(p => {
        if (!p.is_published) { setNotFound(true); return }
        setProfile(p)
        return Promise.all([
          socialService.getByProfile(p.id),
          statsService.getByProfile(p.id).catch(() => null),
          collaborationService.getByProfile(p.id),
          testimonialService.getByProfile(p.id),
          serviceService.getByProfile(p.id),
        ])
      })
      .then(res => {
        if (!res) return
        const [s, st, c, t, sv] = res
        setSocials(s)
        setStats(st)
        setCollabs(c)
        setTestimonials(t)
        setServices(sv as unknown as CreatorService[])
      })
      .catch(() => setNotFound(true))

    // Auto-trigger print if ?print=1
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      setTimeout(() => window.print(), 1200)
    }
  }, [username])

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center text-surface-500">
      Media kit not found.
    </div>
  )
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const categoryLabel = CREATOR_CATEGORIES.find(c => c.value === profile.category)?.label

  return (
    <>
      <Helmet>
        <title>{profile.full_name} — Media Kit | Showkase</title>
        <meta name="description" content={`Media kit for ${profile.full_name}, ${profile.creator_title}`} />
      </Helmet>

      {/* Top bar (hidden on print) */}
      <div className="print:hidden bg-white border-b border-surface-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link to="/" className="text-sm font-bold text-surface-900">Showkase</Link>
        <span className="text-surface-300">·</span>
        <span className="text-sm text-surface-500">{profile.full_name}'s Media Kit</span>
        <div className="ml-auto flex gap-2">
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-surface-600 hover:text-brand-600 px-3 py-1.5 rounded-lg border border-surface-200 hover:border-brand-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Portfolio
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 px-3 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Kit content */}
      <div className="bg-surface-50 min-h-screen py-8 px-4 print:bg-white print:p-0 print:py-0">
        <div
          ref={kitRef}
          className="max-w-3xl mx-auto bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none print:max-w-full"
        >
          {/* Gradient band */}
          <div className="h-2 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400 print:h-1" />

          <div className="p-8 print:p-10 space-y-8">
            {/* Identity */}
            <div className="flex items-start gap-5 pb-8 border-b border-surface-100">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" className="shrink-0" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-surface-900">{profile.full_name}</h1>
                    <p className="text-brand-600 font-semibold mt-0.5">{profile.creator_title}</p>
                    {(profile.city || profile.country) && (
                      <p className="text-surface-400 text-sm mt-1">{[profile.city, profile.country].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                  {categoryLabel && (
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                      {categoryLabel}
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-surface-600 text-sm mt-3 leading-relaxed">{profile.bio}</p>
                )}
                {/* Contact */}
                <div className="flex gap-4 mt-3 text-xs text-surface-500">
                  {profile.show_email && profile.email && <span>📧 {profile.email}</span>}
                  {profile.show_phone && profile.phone && <span>📞 {profile.phone}</span>}
                  <a href={`${APP_URL}/${profile.username}`} className="text-brand-500 font-medium" target="_blank" rel="noreferrer">
                    🔗 {APP_URL}/{profile.username}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div>
                <SectionTitle>Audience & Reach</SectionTitle>
                <div className="grid grid-cols-5 gap-3 mt-3">
                  {[
                    { label: 'Followers',      value: stats.followers },
                    { label: 'Monthly Reach',  value: stats.monthly_reach },
                    { label: 'Avg. Views',     value: stats.avg_views },
                    { label: 'Engagement',     value: stats.engagement_rate, suffix: '%' },
                    { label: 'Collaborations', value: stats.collaborations_count },
                  ].filter(s => s.value != null).map(s => (
                    <div key={s.label} className="bg-surface-50 rounded-xl p-3 text-center border border-surface-100">
                      <p className="text-lg font-bold text-surface-900">
                        {s.suffix ? `${s.value}${s.suffix}` : formatNumber(s.value ?? 0)}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div>
                <SectionTitle>Services Offered</SectionTitle>
                <div className="flex flex-wrap gap-2 mt-3">
                  {services.map(svc => {
                    const st = (svc as unknown as { service_type: string }).service_type
                    const def = SERVICES.find(s => s.value === st)
                    return (
                      <span key={svc.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-200 text-sm font-medium text-surface-700">
                        {def?.icon} {def?.label ?? svc.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Brand Collabs */}
            {collabs.length > 0 && (
              <div>
                <SectionTitle>Brand Collaborations</SectionTitle>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {collabs.slice(0, 6).map(c => (
                    <div key={c.id} className="bg-surface-50 rounded-xl p-3.5 border border-surface-100">
                      <p className="font-bold text-surface-900 text-sm">{c.brand_name}</p>
                      {c.project_description && (
                        <p className="text-xs text-surface-500 mt-1 line-clamp-2">{c.project_description}</p>
                      )}
                      {c.campaign_results && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1.5">📈 {c.campaign_results}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div>
                <SectionTitle>What Brands Say</SectionTitle>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {testimonials.slice(0, 4).map(t => (
                    <div key={t.id} className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-4 border border-violet-100">
                      <p className="text-sm text-surface-700 italic leading-relaxed">"{t.review}"</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                          {t.client_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-surface-900">{t.client_name}</p>
                          {t.company && <p className="text-xs text-surface-400">{t.company}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-surface-100 flex items-center justify-between text-xs text-surface-400">
              <span>Generated by Showkase · showkase.io</span>
              <span>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
      <span className="flex-1 h-px bg-surface-100" />
      {children}
      <span className="flex-1 h-px bg-surface-100" />
    </h2>
  )
}
