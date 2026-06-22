import { supabase } from '@/lib/supabase'
import type { PortfolioStats } from '@/types'

export const statsService = {
  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('portfolio_stats')
      .select('*')
      .eq('profile_id', profileId)
      .single()
    if (error) throw error
    return data as PortfolioStats
  },

  async upsert(profileId: string, stats: Partial<Omit<PortfolioStats, 'id' | 'profile_id' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('portfolio_stats')
      .upsert({ ...stats, profile_id: profileId }, { onConflict: 'profile_id' })
      .select()
      .single()
    if (error) throw error
    return data as PortfolioStats
  },
}
