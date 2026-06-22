import { supabase } from '@/lib/supabase'
import type { SocialLink, SocialPlatform } from '@/types'

export const socialService = {
  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('profile_id', profileId)
    if (error) throw error
    return data as SocialLink[]
  },

  async upsert(profileId: string, platform: SocialPlatform, url: string) {
    const { data, error } = await supabase
      .from('social_links')
      .upsert({ profile_id: profileId, platform, url }, { onConflict: 'profile_id,platform' })
      .select()
      .single()
    if (error) throw error
    return data as SocialLink
  },

  async upsertMany(profileId: string, links: Record<string, string>) {
    const rows = Object.entries(links)
      .filter(([, url]) => url.trim())
      .map(([platform, url]) => ({ profile_id: profileId, platform: platform as SocialPlatform, url }))

    if (!rows.length) return []

    const { data, error } = await supabase
      .from('social_links')
      .upsert(rows, { onConflict: 'profile_id,platform' })
      .select()
    if (error) throw error
    return data as SocialLink[]
  },

  async delete(profileId: string, platform: SocialPlatform) {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('profile_id', profileId)
      .eq('platform', platform)
    if (error) throw error
  },

  async saveAll(profileId: string, links: { platform: SocialPlatform; url: string }[]) {
    await supabase.from('social_links').delete().eq('profile_id', profileId)
    if (!links.length) return []
    const rows = links.map((l, i) => ({ profile_id: profileId, platform: l.platform, url: l.url, display_order: i }))
    const { data, error } = await supabase.from('social_links').insert(rows).select()
    if (error) throw error
    return data as SocialLink[]
  },
}
