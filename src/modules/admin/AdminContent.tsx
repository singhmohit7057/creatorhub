import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber, timeAgo, cn } from '@/utils/helpers'
import type { Profile } from '@/types'

type ContentRow = Profile & { media_count: number; collab_count: number; testimonial_count: number; total_views: number }

type SortKey = 'media' | 'collabs' | 'testimonials' | 'views'

export function AdminContent() {
  const [rows, setRows]       = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort]       = useState<SortKey>('media')

  useEffect(() => {
    Promise.all([
      supabase
        .from('profiles')
        .select('*, media_files(count), brand_collaborations(count), testimonials(count)')
        .neq('role', 'admin')
        .order('created_at', { ascending: false }),
      supabase
        .from('analytics_events')
        .select('profile_id')
        .eq('event_type', 'portfolio_view'),
    ]).then(([{ data: profiles }, { data: events }]) => {
      const viewMap: Record<string, number> = {}
      for (const e of (events ?? [])) {
        viewMap[e.profile_id] = (viewMap[e.profile_id] ?? 0) + 1
      }
      const mapped = ((profiles ?? []) as any[]).map(row => ({
        ...row,
        media_count:       row.media_files?.[0]?.count         ?? 0,
        collab_count:      row.brand_collaborations?.[0]?.count ?? 0,
        testimonial_count: row.testimonials?.[0]?.count         ?? 0,
        total_views:       viewMap[row.id]                      ?? 0,
      })) as ContentRow[]
      setRows(mapped)
      setLoading(false)
    })
  }, [])

  const sorted = [...rows].sort((a, b) =>
    sort === 'media'        ? b.media_count - a.media_count
    : sort === 'collabs'    ? b.collab_count - a.collab_count
    : sort === 'views'      ? b.total_views - a.total_views
    : b.testimonial_count   - a.testimonial_count
  )

  const totals = {
    media:       rows.reduce((s, r) => s + r.media_count, 0),
    collabs:     rows.reduce((s, r) => s + r.collab_count, 0),
    testimonials: rows.reduce((s, r) => s + r.testimonial_count, 0),
    views:       rows.reduce((s, r) => s + r.total_views, 0),
  }

  const SORT_BTNS: { key: SortKey; label: string }[] = [
    { key: 'views',        label: 'Views'        },
    { key: 'media',        label: 'Media'        },
    { key: 'collabs',      label: 'Collabs'      },
    { key: 'testimonials', label: 'Testimonials' },
  ]

  return (
    <>
      <Helmet><title>Content — Admin</title></Helmet>
      <div className="p-4 sm:p-6 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-surface-900">Content Overview</h1>
          <p className="text-sm text-surface-500 mt-0.5">Views, media, collaborations, and testimonials per creator</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Portfolio Views', value: formatNumber(totals.views) },
            { label: 'Total Media Files',      value: totals.media },
            { label: 'Total Collaborations',   value: totals.collabs },
            { label: 'Total Testimonials',     value: totals.testimonials },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-surface-200 p-4 text-center">
              <p className="text-2xl font-black text-surface-900">{item.value}</p>
              <p className="text-xs text-surface-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-medium">Sort by:</span>
          {SORT_BTNS.map(s => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                sort === s.key ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Table — desktop */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden hidden md:block">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-4 py-3 text-left font-medium text-surface-500">Creator</th>
                  <th className="px-4 py-3 text-center font-medium text-surface-500">
                    <button onClick={() => setSort('views')} className={cn('hover:text-brand-600', sort === 'views' && 'text-brand-600')}>Views ↕</button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-surface-500">
                    <button onClick={() => setSort('media')} className={cn('hover:text-brand-600', sort === 'media' && 'text-brand-600')}>Media ↕</button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-surface-500">
                    <button onClick={() => setSort('collabs')} className={cn('hover:text-brand-600', sort === 'collabs' && 'text-brand-600')}>Collabs ↕</button>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-surface-500">
                    <button onClick={() => setSort('testimonials')} className={cn('hover:text-brand-600', sort === 'testimonials' && 'text-brand-600')}>Reviews ↕</button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden lg:table-cell">Last Active</th>
                  <th className="px-4 py-3 text-right font-medium text-surface-500">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {sorted.map(row => (
                  <tr key={row.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={row.avatar_url} name={row.full_name} size="sm" />
                        <div>
                          <p className="font-medium text-surface-900">{row.full_name || '(no name)'}</p>
                          <p className="text-xs text-surface-400">@{row.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-sm font-semibold', sort === 'views' ? 'text-brand-600' : 'text-surface-700')}>{formatNumber(row.total_views)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-sm font-semibold', sort === 'media' ? 'text-brand-600' : 'text-surface-700')}>{row.media_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-sm font-semibold', sort === 'collabs' ? 'text-brand-600' : 'text-surface-700')}>{row.collab_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-sm font-semibold', sort === 'testimonials' ? 'text-brand-600' : 'text-surface-700')}>{row.testimonial_count}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 hidden lg:table-cell">{timeAgo(row.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/${row.username}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden space-y-2">
          {loading
            ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)
            : sorted.map(row => (
              <div key={row.id} className="bg-white rounded-2xl border border-surface-200 px-4 py-3 flex items-center gap-3">
                <Avatar src={row.avatar_url} name={row.full_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{row.full_name || '(no name)'}</p>
                  <p className="text-xs text-surface-400">@{row.username}</p>
                  <div className="flex gap-3 mt-1 text-[11px] text-surface-500">
                    <span>{formatNumber(row.total_views)} views</span>
                    <span>{row.media_count} media</span>
                    <span>{row.collab_count} collabs</span>
                  </div>
                </div>
                <a href={`/${row.username}`} target="_blank" rel="noreferrer"
                  className="shrink-0 p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}
