import { supabase } from '@/lib/supabase'
import type { CreatorService, ServiceType } from '@/types'

export const serviceService = {
  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('creator_services')
      .select('*')
      .eq('profile_id', profileId)
    if (error) throw error
    return data as CreatorService[]
  },

  async toggle(profileId: string, serviceType: ServiceType, title: string) {
    const existing = await supabase
      .from('creator_services')
      .select('id')
      .eq('profile_id', profileId)
      .eq('service_type', serviceType)
      .single()

    if (existing.data) {
      const { error } = await supabase
        .from('creator_services')
        .delete()
        .eq('id', existing.data.id)
      if (error) throw error
      return null
    } else {
      const { data, error } = await supabase
        .from('creator_services')
        .insert({ profile_id: profileId, service_type: serviceType, title })
        .select()
        .single()
      if (error) throw error
      return data as CreatorService
    }
  },

  async setAll(profileId: string, serviceTypes: ServiceType[]) {
    await supabase.from('creator_services').delete().eq('profile_id', profileId)
    if (!serviceTypes.length) return []
    const rows = serviceTypes.map(st => ({
      profile_id: profileId,
      service_type: st,
      title: st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }))
    const { data, error } = await supabase
      .from('creator_services')
      .insert(rows)
      .select()
    if (error) throw error
    return data as CreatorService[]
  },
}
