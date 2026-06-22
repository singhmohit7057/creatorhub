import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Eye, Image, Briefcase, ArrowRight, Mail, ExternalLink,
  TrendingUp, Users, PlayCircle, ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsService } from '@/services/analyticsService'
import { mediaService }     from '@/services/mediaService'
import { collaborationService } from '@/services/collaborationService'
import { inquiryService }   from '@/services/inquiryService'
import { statsService }     from '@/services/statsService'
import { Skeleton }  from '@/components/common/Skeleton'
import { Avatar }    from '@/components/common/Avatar'
import { Button }    from '@/components/common/Button'
import { formatNumber } from '@/utils/helpers'
import { APP_URL }   from '@/utils/constants'
import type { AnalyticsSummary, BrandCollaboration, MediaFile, PortfolioStats } from '@/types'
import { cn } from '@/utils/helpers'

export function DashboardHome() {
  const { profile } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [stats, setStats]         = useState<PortfolioStats | null>(null)
  const [collabs, setCollabs]     = useState<BrandCollaboration[]>([])
  const [media, setMedia]         = useState<MediaFile[]>([])
  const [unread, setUnread]       = useState(0)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      analyticsService.getSummary(profile.id),
      statsService.getByProfile(profile.id),
      collaborationService.getByProfile(profile.id),
      mediaService.getByProfile(profile.id, 'image'),
      inquiryService.getUnreadCount(profile.id),
    ]).then(([ana, st, cols, imgs, unreadCount]) => {
      setAnalytics(ana)
      setStats(st)
      setCollabs(cols.slice(0, 3))
      setMedia(imgs.slice(0, 6))
      setUnread(unreadCount)
    }).finally(() => setLoading(false))
  }, [profile])

  if (!profile) return null

  const completion = (() => {
    let score = 20
    if (profile.avatar_url)    score += 15
    if (profile.bio)           score += 15
    if (profile.creator_title) score += 10
    if (profile.category)      score += 10
    if (media.length > 0)      score += 15
    if (collabs.length > 0)    score += 15
    return Math.min(score, 100)
  })()

  return (
    <>
      <Helmet><title>Dashboard — Showkase</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-surface-900">
                Hey, {profile.full_name.split(' ')[0] || 'Creator'} 👋
              </h1>
              <p className="text-surface-500 text-sm">{profile.creator_title || 'UGC Creator'}</p>
            </div>
          </div>
          {profile.is_published && (
            <a href={`${APP_URL}/${profile.username}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                View Portfolio
              </Button>
            </a>
          )}
        </div>

        {/* ── Profile completion ── */}
        {completion < 100 && (
          <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm">Complete your profile</p>
                <p className="text-xs text-white/75 mt-0.5">100% profiles get 3× more brand inquiries</p>
              </div>
              <span className="text-3xl font-bold">{completion}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
            <div className="flex gap-4 mt-3">
              {!profile.avatar_url && (
                <Link to="/dashboard/settings" className="text-xs text-white/80 underline underline-offset-2">Add photo</Link>
              )}
              {media.length === 0 && (
                <Link to="/dashboard/media" className="text-xs text-white/80 underline underline-offset-2">Upload media</Link>
              )}
              {collabs.length === 0 && (
                <Link to="/dashboard/collaborations" className="text-xs text-white/80 underline underline-offset-2">Add brand collab</Link>
              )}
            </div>
          </div>
        )}

        {/* ── Unread inquiries ── */}
        {unread > 0 && (
          <Link
            to="/dashboard/inquiries"
            className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-200 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {unread} new brand {unread === 1 ? 'inquiry' : 'inquiries'}
                </p>
                <p className="text-xs text-amber-700">Brands are reaching out — don't leave them waiting</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
          </Link>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <StatTile icon={<Eye className="w-4 h-4" />} label="Portfolio Views"  value={formatNumber(analytics?.total_views ?? 0)} color="brand" />
              <StatTile icon={<Users className="w-4 h-4" />} label="Followers"      value={formatNumber(stats?.followers ?? 0)}        color="violet" />
              <StatTile icon={<TrendingUp className="w-4 h-4" />} label="Engagement" value={stats ? `${stats.engagement_rate}%` : '—'}  color="emerald" />
              <StatTile icon={<Briefcase className="w-4 h-4" />} label="Brand Collabs" value={collabs.length}                          color="rose" />
            </>
          )}
        </div>

        {/* ── Two-column content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Collaborations */}
          <div className="bg-white rounded-2xl border border-surface-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <p className="font-semibold text-surface-900 text-sm">Recent Collaborations</p>
              <Link to="/dashboard/collaborations" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : collabs.length === 0 ? (
              <EmptyState icon={<Briefcase className="w-5 h-5" />} label="No collaborations yet" cta="Add one" to="/dashboard/collaborations" />
            ) : (
              <div className="divide-y divide-surface-50">
                {collabs.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 aspect-[9/16] rounded-lg bg-surface-100 shrink-0 overflow-hidden">
                      {c.cover_image_url
                        ? <img src={c.cover_image_url} alt={c.brand_name} className="w-full h-full object-cover" />
                        : c.brand_logo_url
                          ? <img src={c.brand_logo_url} alt={c.brand_name} className="w-full h-full object-contain p-1" />
                          : <Briefcase className="w-4 h-4 text-surface-400 m-auto mt-2" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">{c.brand_name}</p>
                      {c.campaign_results && (
                        <p className="text-xs text-emerald-600 truncate">✓ {c.campaign_results}</p>
                      )}
                    </div>
                    {c.content_type && (
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                        c.content_type === 'reel'  && 'bg-violet-50 text-violet-600',
                        c.content_type === 'post'  && 'bg-blue-50 text-blue-600',
                        c.content_type === 'story' && 'bg-pink-50 text-pink-600',
                      )}>
                        {c.content_type.charAt(0).toUpperCase() + c.content_type.slice(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media preview */}
          <div className="bg-white rounded-2xl border border-surface-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <p className="font-semibold text-surface-900 text-sm">Media Library</p>
              <Link to="/dashboard/media" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
              </div>
            ) : media.length === 0 ? (
              <EmptyState icon={<Image className="w-5 h-5" />} label="No media yet" cta="Upload now" to="/dashboard/media" />
            ) : (
              <div className="p-4 grid grid-cols-3 gap-2">
                {media.map(m => (
                  <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-surface-100">
                    <img src={m.url} alt={m.title ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/dashboard/media',          icon: Image,       label: 'Upload Media',    color: 'bg-blue-50 text-blue-600' },
            { to: '/dashboard/collaborations', icon: Briefcase,   label: 'Add Collab',      color: 'bg-violet-50 text-violet-600' },
            { to: '/dashboard/template',       icon: Sparkles,    label: 'Change Template', color: 'bg-pink-50 text-pink-600' },
            { to: '/dashboard/media-kit',      icon: PlayCircle,  label: 'View Media Kit',  color: 'bg-emerald-50 text-emerald-600' },
          ].map(a => (
            <Link
              key={a.to}
              to={a.to}
              className="bg-white rounded-2xl border border-surface-200 p-4 hover:shadow-sm hover:border-brand-200 transition-all flex flex-col items-center gap-2 text-center group"
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform', a.color)}>
                <a.icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-surface-700">{a.label}</p>
            </Link>
          ))}
        </div>

      </div>
    </>
  )
}

function StatTile({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'brand' | 'violet' | 'emerald' | 'rose'
}) {
  const colors = {
    brand:   'bg-brand-50 text-brand-600',
    violet:  'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-4">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3', colors[color])}>
        {icon}
      </div>
      <p className="text-xl font-bold text-surface-900">{value}</p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState({ icon, label, cta, to }: { icon: React.ReactNode; label: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-surface-400">
      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">{icon}</div>
      <p className="text-sm">{label}</p>
      <Link to={to} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
        {cta} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
