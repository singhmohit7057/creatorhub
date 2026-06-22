import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatNumber, cn } from '@/utils/helpers'
import type { Profile } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  beauty: 'bg-pink-400', fashion: 'bg-purple-400', lifestyle: 'bg-indigo-400',
  travel: 'bg-amber-400', food: 'bg-red-400', fitness: 'bg-green-400',
  tech: 'bg-blue-400', gaming: 'bg-violet-400', education: 'bg-teal-400',
  finance: 'bg-emerald-400', parenting: 'bg-orange-400', other: 'bg-gray-400',
}

type RangePreset = '7d' | '1m' | '6m' | '1y' | 'custom'

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: '7d',     label: '7 Days'   },
  { key: '1m',     label: '1 Month'  },
  { key: '6m',     label: '6 Months' },
  { key: '1y',     label: '1 Year'   },
  { key: 'custom', label: 'Custom'   },
]

function presetToDays(preset: RangePreset): number {
  if (preset === '7d') return 7
  if (preset === '1m') return 30
  if (preset === '6m') return 180
  return 365
}

type SignupDay = { date: string; count: number }

export function AdminAnalytics() {
  const [creators, setCreators]       = useState<Profile[]>([])
  const [totalUsers, setTotalUsers]   = useState(0)
  const [allTrend, setAllTrend]       = useState<SignupDay[]>([])
  const [loading, setLoading]         = useState(true)

  const [preset, setPreset]         = useState<RangePreset>('1m')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo]     = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').neq('role', 'admin').order('created_at', { ascending: false }).limit(500),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabase.from('profiles').select('created_at').neq('role', 'admin').order('created_at', { ascending: true }),
    ]).then(([{ data: profiles }, { count }, { data: signups }]) => {
      setCreators((profiles as Profile[]) ?? [])
      setTotalUsers(count ?? 0)
      // Build daily signup trend from actual created_at data
      const byDay: Record<string, number> = {}
      for (const row of (signups ?? [])) {
        const day = (row as { created_at: string }).created_at.slice(0, 10)
        byDay[day] = (byDay[day] ?? 0) + 1
      }
      setAllTrend(Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })))
      setLoading(false)
    })
  }, [])

  const trend = (() => {
    if (preset === 'custom' && customFrom && customTo) {
      return allTrend.filter(d => d.date >= customFrom && d.date <= customTo)
    }
    return allTrend.slice(-presetToDays(preset))
  })()

  const useWeekly = trend.length > 60
  const chartData = (() => {
    if (!useWeekly) return trend
    const weeks: SignupDay[] = []
    for (let i = 0; i < trend.length; i += 7) {
      const slice = trend.slice(i, i + 7)
      weeks.push({ date: slice[0]?.date ?? '', count: slice.reduce((s, d) => s + d.count, 0) })
    }
    return weeks
  })()

  const maxCount   = Math.max(...chartData.map(t => t.count), 1)
  const trendTotal = trend.reduce((s, t) => s + t.count, 0)

  const categoryCounts = creators.reduce<Record<string, number>>((acc, c) => {
    if (c.category) acc[c.category] = (acc[c.category] ?? 0) + 1
    return acc
  }, {})
  const sortedCats    = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const totalCreators = creators.length || 1

  const publishedPct = creators.length ? Math.round((creators.filter(c => c.is_published).length / creators.length) * 100) : 0
  const verifiedPct  = creators.length ? Math.round((creators.filter(c => c.is_verified).length  / creators.length) * 100) : 0
  const suspendedPct = creators.length ? Math.round((creators.filter(c => c.status === 'suspended').length / creators.length) * 100) : 0

  function fmtShort(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }
  function fmtFull(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const rangeLabel = trend.length
    ? `${fmtFull(trend[0].date)} – ${fmtFull(trend[trend.length - 1].date)}`
    : '—'

  return (
    <>
      <Helmet><title>Analytics — Admin</title></Helmet>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">

        {/* Header + range selector */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Platform Analytics</h1>
            <p className="text-sm text-surface-500 mt-0.5">Growth trends, creator breakdown, and platform health</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  preset === p.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {preset === 'custom' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <CalendarDays className="w-4 h-4 text-surface-400 shrink-0" />
              <span className="text-xs font-medium text-surface-600">From</span>
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={e => setCustomFrom(e.target.value)}
                className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs font-medium text-surface-600">To</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={e => setCustomTo(e.target.value)}
                className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {trend.length > 0 && (
                <span className="text-xs text-surface-400">{trend.length} day{trend.length !== 1 ? 's' : ''} selected · {trendTotal} signups</span>
              )}
            </div>
          </div>
        )}

        {/* Vitals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Creators', value: formatNumber(totalUsers) },
            { label: 'Published',      value: `${publishedPct}%` },
            { label: 'Verified',       value: `${verifiedPct}%` },
            { label: 'Suspended',      value: `${suspendedPct}%` },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-surface-200 p-4 text-center">
              <p className="text-2xl font-black text-surface-900">{loading ? '—' : item.value}</p>
              <p className="text-xs text-surface-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Signup Trend */}
        <div className="bg-white rounded-2xl border border-surface-200 p-5">
          <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold text-surface-900">Signup Trend</p>
              <p className="text-xs text-surface-400 mt-0.5">
                {rangeLabel}
                {preset !== 'custom' && (
                  <> · <span className="font-medium text-surface-700">{trendTotal} signups</span></>
                )}
                {useWeekly && <span className="ml-1.5 text-surface-300">· weekly buckets</span>}
              </p>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-surface-400">
              {loading ? 'Loading…' : preset === 'custom' && (!customFrom || !customTo) ? 'Select a date range above' : 'No data for selected range'}
            </div>
          ) : (
            <div className="flex items-end gap-0.5 h-36">
              {chartData.map((day, i) => {
                const heightPct = Math.max((day.count / maxCount) * 100, 3)
                return (
                  <div key={`${day.date}-${i}`} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                    <div className="relative w-full flex flex-col items-center justify-end h-28">
                      <div
                        className="w-full bg-brand-500 rounded-t-sm group-hover:bg-brand-600 transition-colors"
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-surface-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                        {day.count} · {fmtShort(day.date)}
                      </div>
                    </div>
                    {chartData.length <= 31 && (
                      <span className="text-[8px] text-surface-300 truncate w-full text-center hidden sm:block">
                        {fmtShort(day.date).split(' ')[0]}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-surface-200 p-5">
          <p className="text-sm font-semibold text-surface-900 mb-4">Creator Categories</p>
          <div className="space-y-3">
            {sortedCats.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs font-medium text-surface-600 capitalize w-20 shrink-0">{cat}</span>
                <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', CATEGORY_COLORS[cat] ?? 'bg-brand-400')}
                    style={{ width: `${(count / totalCreators) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-surface-500 w-16 text-right">
                  {count} ({Math.round((count / totalCreators) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Template Distribution */}
        <div className="bg-white rounded-2xl border border-surface-200 p-5">
          <p className="text-sm font-semibold text-surface-900 mb-4">Template Usage</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['minimal', 'modern-dark', 'fashion-premium', 'creative-grid'] as const).map(tpl => {
              const count = creators.filter(c => c.template === tpl).length
              const pct   = creators.length ? Math.round((count / creators.length) * 100) : 0
              return (
                <div key={tpl} className="border border-surface-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-surface-900">{pct}%</p>
                  <p className="text-[10px] text-surface-400 mt-0.5 capitalize">{tpl.replace(/-/g, ' ')}</p>
                  <p className="text-xs text-surface-300 mt-0.5">{count} creator{count !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </>
  )
}
