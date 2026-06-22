import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/types'

export const testimonialService = {
  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as Testimonial[]
  },

  async create(profileId: string, userId: string, t: Omit<Testimonial, 'id' | 'profile_id' | 'created_at'>, avatarFile?: File) {
    let avatar_url = t.avatar_url
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('testimonials').upload(path, avatarFile)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('testimonials').getPublicUrl(path)
      avatar_url = data.publicUrl
    }
    const { data, error } = await supabase
      .from('testimonials')
      .insert({ ...t, profile_id: profileId, avatar_url })
      .select()
      .single()
    if (error) throw error
    return data as Testimonial
  },

  async update(id: string, updates: Partial<Testimonial>) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Testimonial
  },

  async delete(id: string) {
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) throw error
  },
}
