import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link2, Download, ExternalLink, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { socialService }       from '@/services/socialService'
import { statsService }        from '@/services/statsService'
import { collaborationService } from '@/services/collaborationService'
import { testimonialService }  from '@/services/testimonialService'
import { serviceService }      from '@/services/serviceService'
import { APP_URL, CREATOR_CATEGORIES, SERVICES } from '@/utils/constants'
import { formatNumber } from '@/utils/helpers'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import type { PortfolioStats, BrandCollaboration, Testimonial, CreatorService } from '@/types'

export function MediaKitPage() {
  const { profile } = useAuth()
  const [,             setSocials]      = useState<unknown[]>([])
  const [stats,        setStats]        = useState<PortfolioStats | null>(null)
  const [collabs,      setCollabs]      = useState<BrandCollaboration[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [services,     setServices]     = useState<CreatorService[]>([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      socialService.getByProfile(profile.id),
      statsService.getByProfile(profile.id).catch(() => null),
      collaborationService.getByProfile(profile.id),
      testimonialService.getByProfile(profile.id),
      serviceService.getByProfile(profile.id),
    ]).then(([s, st, c, t, sv]) => {
      setSocials(s)
      setStats(st)
      setCollabs(c)
      setTestimonials(t)
      setServices(sv.map(x => x as unknown as CreatorService))
    }).finally(() => setLoading(false))
  }, [profile])

  const mediaKitUrl = `${APP_URL}/${profile?.username}/media-kit`
  const categoryLabel = CREATOR_CATEGORIES.find(c => c.value === profile?.category)?.label

  function copyLink() {
    navigator.clipboard.writeText(mediaKitUrl)
    toast.success('Link copied!')
  }

  if (loading || !profile) return null

  return (
    <>
      <Helmet><title>Media Kit — Showkase</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Media Kit</h1>
            <p className="text-surface-500 text-sm mt-0.5">Auto-generated from your portfolio — share with brands</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Link2 className="w-4 h-4" /> Copy Link
            </button>
            <a
              href={`/${profile.username}/media-kit`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview
            </a>
            <Button
              onClick={() => window.open(`/${profile.username}/media-kit?print=1`, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Shareable URL */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
          <ExternalLink className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-sm text-brand-700 font-medium flex-1 truncate">{mediaKitUrl}</span>
          <button onClick={copyLink} className="text-xs font-semibold text-brand-600 hover:text-brand-800 shrink-0">
            Copy
          </button>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Top gradient band */}
          <div className="h-3 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400" />

          <div className="p-8">
            {/* Identity */}
            <div className="flex items-start gap-5 mb-8 pb-8 border-b border-surface-100">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" className="shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-surface-900">{profile.full_name}</h2>
                <p className="text-brand-600 font-medium mt-0.5">{profile.creator_title}</p>
                {(profile.city || profile.country) && (
                  <p className="text-surface-400 text-sm mt-1">{[profile.city, profile.country].filter(Boolean).join(', ')}</p>
                )}
                {categoryLabel && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                    {categoryLabel}
                  </span>
                )}
                {profile.bio && <p className="text-surface-600 text-sm mt-3 leading-relaxed max-w-xl">{profile.bio}</p>}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">Audience & Reach</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: 'Followers',       value: stats.followers },
                    { label: 'Monthly Reach',   value: stats.monthly_reach },
                    { label: 'Avg. Views',      value: stats.avg_views },
                    { label: 'Engagement',      value: stats.engagement_rate, suffix: '%' },
                    { label: 'Collaborations',  value: stats.collaborations_count },
                  ].filter(s => s.value).map(s => (
                    <div key={s.label} className="bg-surface-50 rounded-2xl p-4 text-center border border-surface-100">
                      <p className="text-xl font-bold text-surface-900">
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
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map(svc => {
                    const def = SERVICES.find(s => s.value === (svc as unknown as { service_type: string }).service_type)
                    return (
                      <span key={svc.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-200 text-sm font-medium text-surface-700">
                        {def?.icon} {def?.label ?? svc.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Collabs */}
            {collabs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">Brand Collaborations</h3>
                <div className="grid grid-cols-3 gap-3">
                  {collabs.slice(0, 6).map(c => (
                    <div key={c.id} className="bg-surface-50 rounded-xl p-3.5 border border-surface-100">
                      <p className="font-semibold text-surface-900 text-sm">{c.brand_name}</p>
                      {c.project_description && <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{c.project_description}</p>}
                      {c.campaign_results && (
                        <p className="text-xs text-emerald-600 font-medium mt-1.5">📈 {c.campaign_results}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-4">What Brands Say</h3>
                <div className="grid grid-cols-2 gap-4">
                  {testimonials.slice(0, 2).map(t => (
                    <div key={t.id} className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-4 border border-violet-100">
                      <p className="text-sm text-surface-700 italic leading-relaxed">"{t.review}"</p>
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-surface-900">{t.client_name}</p>
                        {t.company && <p className="text-xs text-surface-400">{t.company}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="pt-6 border-t border-surface-100 flex items-center justify-between">
              <div className="text-sm text-surface-500">
                {profile.show_email && profile.email && <p>📧 {profile.email}</p>}
                {profile.show_phone && profile.phone && <p className="mt-0.5">📞 {profile.phone}</p>}
              </div>
              <a
                href={`${APP_URL}/${profile.username}`}
                className="text-xs text-surface-400 hover:text-brand-600"
                target="_blank"
                rel="noreferrer"
              >
                {APP_URL}/{profile.username}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
