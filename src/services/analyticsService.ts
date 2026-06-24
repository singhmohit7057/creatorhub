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

export interface DailyView    { date: string; views: number }
export interface ReferrerEntry { referrer: string; count: number }
export interface CountryEntry  { country: string; count: number }

interface RPCViewRow     { date: string; views: string }
interface RPCReferrerRow { referrer: string; count: string }
interface RPCSocialRow   { platform: string; count: string }

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

  // ── Read via RPC (aggregated in Postgres, not client-side) ──

  async getSummary(profileId: string): Promise<AnalyticsSummary> {
    const { data, error } = await supabase.rpc('get_analytics_summary', {
      p_profile_id: profileId,
    })
    if (error || !data) {
      return { total_views: 0, unique_visitors: 0, contact_submissions: 0, views_this_week: 0, views_last_week: 0 }
    }
    return data as AnalyticsSummary
  },

  async getDailyViews(profileId: string, days = 30): Promise<DailyView[]> {
    const { data } = await supabase.rpc('get_daily_views_v2', {
      p_profile_id: profileId,
      p_days:       days,
    })
    return ((data as RPCViewRow[]) ?? []).map(row => ({
      date:  row.date,
      views: Number(row.views),
    }))
  },

  async getTopReferrers(profileId: string): Promise<ReferrerEntry[]> {
    const { data } = await supabase.rpc('get_top_referrers_v2', {
      p_profile_id: profileId,
    })
    return ((data as RPCReferrerRow[]) ?? []).map(row => {
      let ref = row.referrer
      try { ref = new URL(ref).hostname.replace('www.', '') } catch { /* keep raw */ }
      return { referrer: ref, count: Number(row.count) }
    })
  },

  async getSocialClicks(profileId: string): Promise<Record<string, number>> {
    const { data } = await supabase.rpc('get_social_clicks_v2', {
      p_profile_id: profileId,
    })
    const counts: Record<string, number> = {}
    for (const row of (data as RPCSocialRow[]) ?? []) {
      counts[row.platform] = Number(row.count)
    }
    return counts
  },

  async getAdminStats() {
    const [users, published, totalViews, media] = await Promise.all([
      supabase.from('profiles').select('*',    { count: 'exact', head: true }),
      supabase.from('profiles').select('*',    { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'portfolio_view'),
      supabase.from('media_files').select('*', { count: 'exact', head: true }),
    ])
    return {
      total_users:         users.count      ?? 0,
      total_portfolios:    published.count  ?? 0,
      total_views:         totalViews.count ?? 0,
      total_media_uploads: media.count      ?? 0,
    }
  },
}
