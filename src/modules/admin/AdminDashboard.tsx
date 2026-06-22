import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Users, Globe, Eye, Image, MailOpen, UserPlus, Activity, BadgeCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/common/StatCard'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber, timeAgo, cn } from '@/utils/helpers'
import type { Profile } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  beauty: 'bg-pink-400', fashion: 'bg-purple-400', lifestyle: 'bg-indigo-400',
  travel: 'bg-amber-400', food: 'bg-red-400', fitness: 'bg-green-400',
  tech: 'bg-blue-400', gaming: 'bg-violet-400', education: 'bg-teal-400',
  finance: 'bg-emerald-400', parenting: 'bg-orange-400', other: 'bg-gray-400',
}

interface AdminStats {
  total_users: number
  total_portfolios: number
  total_views: number
  total_media_uploads: number
  new_users_today: number
  new_users_week: number
  active_this_week: number
  unread_inquiries: number
  pending_verifications: number
  approved_verifications: number
}

export function AdminDashboard() {
  const [stats, setStats]       = useState<AdminStats | null>(null)
  const [recent, setRecent]     = useState<Profile[]>([])
  const [featured, setFeatured] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString()

    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').eq('is_published', true),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'portfolio_view'),
      supabase.from('media_files').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', today),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('created_at', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin').gte('updated_at', weekAgo).eq('status', 'active'),
      supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false }).limit(5),
      supabase.from('profiles').select('*').neq('role', 'admin').eq('is_featured', true).limit(12),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    ]).then(([
      { count: total_users },
      { count: total_portfolios },
      { count: total_views },
      { count: total_media_uploads },
      { count: new_users_today },
      { count: new_users_week },
      { count: active_this_week },
      { count: unread_inquiries },
      { data: profiles },
      { data: featuredProfiles },
      { count: pending_verifications },
      { count: approved_verifications },
    ]) => {
      setStats({
        total_users:           total_users           ?? 0,
        total_portfolios:      total_portfolios      ?? 0,
        total_views:           total_views           ?? 0,
        total_media_uploads:   total_media_uploads   ?? 0,
        new_users_today:       new_users_today       ?? 0,
        new_users_week:        new_users_week        ?? 0,
        active_this_week:      active_this_week      ?? 0,
        unread_inquiries:      unread_inquiries      ?? 0,
        pending_verifications: pending_verifications ?? 0,
        approved_verifications: approved_verifications ?? 0,
      })
      setRecent((profiles as Profile[]) ?? [])
      setFeatured((featuredProfiles as Profile[]) ?? [])
      setLoading(false)
    })
  }, [])

  const categoryCounts = recent.reduce<Record<string, number>>((acc, c) => {
    if (c.category) acc[c.category] = (acc[c.category] ?? 0) + 1
    return acc
  }, {})
  const maxCount = Math.max(...Object.values(categoryCounts), 1)
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  return (
    <>
      <Helmet><title>Overview — Admin</title></Helmet>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-surface-900">Overview</h1>
          <p className="text-sm text-surface-500 mt-0.5">Platform snapshot — all creators, views, and activity</p>
        </div>

        {/* Stats grid */}
        {loading || !stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Creators"   value={formatNumber(stats.total_users)}         icon={<Users className="w-5 h-5" />} trend={{ value: stats.new_users_week, label: 'new this week', unit: '' }} />
              <StatCard title="Live Portfolios"  value={formatNumber(stats.total_portfolios)}    icon={<Globe className="w-5 h-5" />} />
              <StatCard title="Platform Views"   value={formatNumber(stats.total_views)}         icon={<Eye   className="w-5 h-5" />} />
              <StatCard title="Media Uploads"    value={formatNumber(stats.total_media_uploads)} icon={<Image className="w-5 h-5" />} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Signups Today"          value={stats.new_users_today}          icon={<UserPlus   className="w-5 h-5" />} />
              <StatCard title="Active Creators"        value={stats.active_this_week}         icon={<Activity   className="w-5 h-5" />} />
              <StatCard title="Unread Inquiries"       value={stats.unread_inquiries}         icon={<MailOpen   className="w-5 h-5" />} />
              <div className="bg-white rounded-2xl border border-surface-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-surface-500">Verifications</p>
                  <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-brand-500" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-2xl font-black text-surface-900">{stats.pending_verifications}</p>
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">Pending</p>
                  </div>
                  <div className="w-px h-8 bg-surface-100" />
                  <div>
                    <p className="text-2xl font-black text-surface-900">{stats.approved_verifications}</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Approved</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Two-column: Recent Signups + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Signups */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-surface-900">Recent Signups</p>
              <Link to="/admin/creators" className="text-xs text-brand-600 hover:underline font-medium">View all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-50 transition-colors gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={c.avatar_url} name={c.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{c.full_name}</p>
                        <p className="text-xs text-surface-400 truncate">@{c.username}{c.city ? ` · ${c.city}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.is_published
                        ? <Badge variant="success">Live</Badge>
                        : <Badge variant="default">Draft</Badge>
                      }
                      <span className="text-xs text-surface-400 hidden sm:block">{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <p className="text-sm font-semibold text-surface-900 mb-4">Creator Categories</p>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-6 rounded" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 capitalize">{cat}</span>
                      <span className="text-xs text-surface-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', CATEGORY_COLORS[cat] ?? 'bg-brand-400')}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Creators strip */}
        {featured.length > 0 && (
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-surface-900">Featured Creators</p>
              <Link to="/admin/creators" className="text-xs text-brand-600 hover:underline font-medium">Manage →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {featured.map(c => (
                <Link
                  key={c.id}
                  to={`/${c.username}`}
                  target="_blank"
                  className="shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all w-28"
                >
                  <Avatar src={c.avatar_url} name={c.full_name} size="md" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-surface-900 truncate w-full">{c.full_name.split(' ')[0]}</p>
                    <p className="text-[10px] text-surface-400 capitalize">{c.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
