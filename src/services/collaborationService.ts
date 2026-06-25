import { supabase } from '@/lib/supabase'
import type { BrandCollaboration } from '@/types'

export const collaborationService = {
  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('brand_collaborations')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as BrandCollaboration[]
  },

  async create(
    profileId: string,
    userId: string,
    collab: Omit<BrandCollaboration, 'id' | 'profile_id' | 'created_at'>,
    logoFile?: File,
    coverFile?: File,
  ) {
    let logo_url = collab.brand_logo_url
    if (logoFile) {
      const ext  = logoFile.name.split('.').pop()
      const path = `${userId}/logo_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('logos').upload(path, logoFile)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      logo_url = data.publicUrl
    }

    let cover_url = collab.cover_image_url
    if (coverFile) {
      const ext  = coverFile.name.split('.').pop()
      const path = `${userId}/cover_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('logos').upload(path, coverFile)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      cover_url = data.publicUrl
    }

    const { data, error } = await supabase
      .from('brand_collaborations')
      .insert({ ...collab, profile_id: profileId, brand_logo_url: logo_url, cover_image_url: cover_url })
      .select()
      .single()
    if (error) throw error
    return data as BrandCollaboration
  },

  async update(
    id: string,
    userId: string,
    updates: Partial<BrandCollaboration>,
    logoFile?: File,
    coverFile?: File,
  ) {
    if (logoFile) {
      const ext  = logoFile.name.split('.').pop()
      const path = `${userId}/logo_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('logos').upload(path, logoFile)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      updates.brand_logo_url = data.publicUrl
    }
    if (coverFile) {
      const ext  = coverFile.name.split('.').pop()
      const path = `${userId}/cover_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('logos').upload(path, coverFile)
      if (upErr) throw upErr
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      updates.cover_image_url = data.publicUrl
    }
    const { data, error } = await supabase
      .from('brand_collaborations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as BrandCollaboration
  },

  async delete(id: string) {
    const { error } = await supabase.from('brand_collaborations').delete().eq('id', id)
    if (error) throw error
  },
}
