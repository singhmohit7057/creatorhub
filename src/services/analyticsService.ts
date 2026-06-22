import { supabase } from '@/lib/supabase'
import { generateVisitorId } from '@/utils/helpers'
import type { AnalyticsSummary } from '@/types'

const EDGE_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`

async function track(payload: Record<string, unknown>) {
  try {
    const res = await fetch(EDGE_FN, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (res.ok) return
    throw new Error(`edge fn ${res.status}`)
  } catch {
    // Edge function unavailable (local dev) — insert directly
    try {
      await supabase.from('analytics_events').insert({
        profile_id: payload.profile_id,
        event_type: payload.event_type,
        visitor_id: payload.visitor_id ?? null,
        referrer:   payload.referrer   ?? null,
        platform:   payload.platform   ?? null,
        country:    null,
      })
    } catch {
      // silently fail — never break the user experience for analytics
    }
  }
}

export interface DailyView { date: string; views: number }
export interface ReferrerEntry { referrer: string; count: number }
export interface CountryEntry { country: string; count: number }

export const analyticsService = {
  // ── Write via edge function ────────────────────────────────

  trackView(profileId: string) {
    return track({
      profile_id: profileId,
      event_type: 'portfolio_view',
      visitor_id: generateVisitorId(),
      referrer:   document.referrer || null,
    })
  },

  trackSocialClick(profileId: string, platform: string) {
    return track({
      profile_id: profileId,
      event_type: 'social_click',
      visitor_id: generateVisitorId(),
      platform,
    })
  },

  trackContactSubmission(profileId: string) {
    return track({
      profile_id: profileId,
      event_type: 'contact_submission',
      visitor_id: generateVisitorId(),
    })
  },

  // ── Read directly from Supabase ────────────────────────────

  async getSummary(profileId: string): Promise<AnalyticsSummary> {
    const now          = new Date()
    const weekAgo      = new Date(now.getTime() -  7 * 86400_000).toISOString()
    const twoWeeksAgo  = new Date(now.getTime() - 14 * 86400_000).toISOString()

    const [totalViewsRes, uniqueRes, contactRes, thisWeekRes, lastWeekRes] = await Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId).eq('event_type', 'portfolio_view'),
      supabase.from('analytics_events').select('visitor_id')
        .eq('profile_id', profileId).eq('event_type', 'portfolio_view'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId).eq('event_type', 'contact_submission'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId).eq('event_type', 'portfolio_view')
        .gte('created_at', weekAgo),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId).eq('event_type', 'portfolio_view')
        .gte('created_at', twoWeeksAgo).lt('created_at', weekAgo),
    ])

    const uniqueVisitors = new Set(uniqueRes.data?.map(r => r.visitor_id)).size

    return {
      total_views:         totalViewsRes.count ?? 0,
      unique_visitors:     uniqueVisitors,
      contact_submissions: contactRes.count    ?? 0,
      views_this_week:     thisWeekRes.count   ?? 0,
      views_last_week:     lastWeekRes.count   ?? 0,
    }
  },

  async getDailyViews(profileId: string, days = 30): Promise<DailyView[]> {
    const since = new Date(Date.now() - days * 86400_000).toISOString()
    const { data } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('profile_id', profileId)
      .eq('event_type', 'portfolio_view')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    // Group by date client-side
    const counts: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400_000)
      counts[d.toISOString().slice(0, 10)] = 0
    }
    for (const row of data ?? []) {
      const day = (row.created_at as string).slice(0, 10)
      if (day in counts) counts[day]++
    }
    return Object.entries(counts).map(([date, views]) => ({ date, views }))
  },

  async getTopReferrers(profileId: string): Promise<ReferrerEntry[]> {
    const { data } = await supabase
      .from('analytics_events')
      .select('referrer')
      .eq('profile_id', profileId)
      .eq('event_type', 'portfolio_view')
      .not('referrer', 'is', null)

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      let ref = row.referrer as string
      try { ref = new URL(ref).hostname.replace('www.', '') } catch { /* keep raw */ }
      counts[ref] = (counts[ref] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  },

  async getSocialClicks(profileId: string): Promise<Record<string, number>> {
    const { data } = await supabase
      .from('analytics_events')
      .select('platform')
      .eq('profile_id', profileId)
      .eq('event_type', 'social_click')
      .not('platform', 'is', null)

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const p = row.platform as string
      counts[p] = (counts[p] ?? 0) + 1
    }
    return counts
  },

  async getAdminStats() {
    const [users, published, totalViews, media] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'portfolio_view'),
      supabase.from('media_files').select('*', { count: 'exact', head: true }),
    ])
    return {
      total_users:         users.count     ?? 0,
      total_portfolios:    published.count ?? 0,
      total_views:         totalViews.count ?? 0,
      total_media_uploads: media.count     ?? 0,
    }
  },
}
