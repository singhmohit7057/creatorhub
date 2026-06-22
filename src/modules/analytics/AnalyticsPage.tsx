import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Eye, Users, Mail, TrendingUp, TrendingDown, MousePointerClick, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsService } from '@/services/analyticsService'
import { StatCard } from '@/components/common/StatCard'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber } from '@/utils/helpers'
import { cn } from '@/utils/helpers'
import type { AnalyticsSummary } from '@/types'
import type { DailyView, ReferrerEntry } from '@/services/analyticsService'

// ── Mini bar chart ───────────────────────────────────────────
function BarChart({ data }: { data: DailyView[] }) {
  const max = Math.max(...data.map(d => d.views), 1)
  const last7 = data.slice(-7)

  return (
    <div className="space-y-2">
      {/* Full 30-day bars */}
      <div className="flex items-end gap-0.5 h-24">
        {data.map((d, i) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className={cn(
                'w-full rounded-sm transition-all',
                i >= data.length - 7 ? 'bg-brand-500' : 'bg-brand-200',
                'group-hover:bg-brand-600',
              )}
              style={{ height: `${Math.max((d.views / max) * 100, 2)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-surface-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                {d.date.slice(5)}: {d.views} views
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* X-axis labels — first, mid, last */}
      <div className="flex justify-between text-xs text-surface-400">
        <span>{data[0]?.date.slice(5)}</span>
        <span className="text-brand-500 font-medium">Last 7 days: {last7.reduce((a, b) => a + b.views, 0)} views</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const { profile } = useAuth()
  const [summary, setSummary]           = useState<AnalyticsSummary | null>(null)
  const [dailyViews, setDailyViews]     = useState<DailyView[]>([])
  const [referrers, setReferrers]       = useState<ReferrerEntry[]>([])
  const [socialClicks, setSocialClicks] = useState<Record<string, number>>({})
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      analyticsService.getSummary(profile.id),
      analyticsService.getDailyViews(profile.id, 30),
      analyticsService.getTopReferrers(profile.id),
      analyticsService.getSocialClicks(profile.id),
    ]).then(([s, dv, ref, sc]) => {
      setSummary(s)
      setDailyViews(dv)
      setReferrers(ref)
      setSocialClicks(sc)
    }).finally(() => setLoading(false))
  }, [profile])

  const weeklyChange = summary
    ? summary.views_last_week > 0
      ? Math.round(((summary.views_this_week - summary.views_last_week) / summary.views_last_week) * 100)
      : summary.views_this_week > 0 ? 100 : 0
    : 0

  const totalClicks = Object.values(socialClicks).reduce((a, b) => a + b, 0)
  const totalReferrers = referrers.reduce((a, b) => a + b.count, 0)

  return (
    <>
      <Helmet><title>Analytics — Showkase</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Analytics</h1>
          <p className="text-surface-500 text-sm mt-0.5">Track your portfolio performance</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Views"     value={formatNumber(summary?.total_views ?? 0)}     icon={<Eye className="w-5 h-5" />} subtitle="All time" />
              <StatCard title="Unique Visitors" value={formatNumber(summary?.unique_visitors ?? 0)} icon={<Users className="w-5 h-5" />} subtitle="All time" />
              <StatCard
                title="This Week"
                value={formatNumber(summary?.views_this_week ?? 0)}
                icon={weeklyChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                trend={summary ? { value: weeklyChange, label: 'vs last week' } : undefined}
              />
              <StatCard title="Inquiries" value={summary?.contact_submissions ?? 0} icon={<Mail className="w-5 h-5" />} subtitle="Total contact forms" />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <h2 className="text-sm font-semibold text-surface-900 mb-4">Portfolio Views — Last 30 days</h2>
              <BarChart data={dailyViews} />
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-2 gap-5">
              {/* Top referrers */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5">
                <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-surface-400" /> Top Referrers
                </h2>
                {referrers.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-4">No referrer data yet</p>
                ) : (
                  <div className="space-y-3">
                    {referrers.map(r => (
                      <div key={r.referrer}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-surface-700 font-medium truncate">{r.referrer}</span>
                          <span className="text-xs text-surface-400 ml-2 shrink-0">{r.count}</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-400 rounded-full transition-all"
                            style={{ width: `${Math.round((r.count / totalReferrers) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social link clicks */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5">
                <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-surface-400" /> Social Link Clicks
                </h2>
                {totalClicks === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-4">No click data yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(socialClicks)
                      .sort((a, b) => b[1] - a[1])
                      .map(([platform, count]) => (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-surface-700 font-medium capitalize">{platform}</span>
                            <span className="text-xs text-surface-400">{count}</span>
                          </div>
                          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-400 rounded-full transition-all"
                              style={{ width: `${Math.round((count / totalClicks) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
