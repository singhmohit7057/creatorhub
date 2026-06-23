import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export const profileService = {
  async getByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    if (error) throw error
    return data as Profile
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data as Profile
  },

  async update(profileId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single()
    if (error) throw error
    return data as Profile
  },

  async checkUsernameAvailable(username: string, excludeProfileId?: string) {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
    if (excludeProfileId) query = query.neq('id', excludeProfileId)
    const { data } = await query
    return !data || data.length === 0
  },

  async searchPublic(query: string, filters: { category?: string; country?: string; city?: string }) {
    let q = supabase
      .from('profiles')
      .select('id,username,full_name,creator_title,bio,avatar_url,category,city,country,is_featured')
      .eq('is_published', true)
      .eq('status', 'active')
      .eq('show_on_explore', true)

    if (query) {
      q = q.or(`full_name.ilike.%${query}%,username.ilike.%${query}%,creator_title.ilike.%${query}%`)
    }
    if (filters.category) q = q.eq('category', filters.category)
    if (filters.country)  q = q.eq('country',  filters.country)
    if (filters.city)     q = q.ilike('city',  `%${filters.city}%`)

    const { data, error } = await q.order('is_featured', { ascending: false }).limit(50)
    if (error) throw error
    return data
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext  = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  },

  async uploadCover(userId: string, file: File): Promise<string> {
    const ext  = file.name.split('.').pop()
    const path = `${userId}/cover.${ext}`
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    return data.publicUrl
  },
}
