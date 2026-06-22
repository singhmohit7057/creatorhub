import { supabase } from '@/lib/supabase'
import type { ContactInquiry, ContactInquiryForm } from '@/types'

export const inquiryService = {
  async submit(profileId: string, form: ContactInquiryForm) {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert({ ...form, profile_id: profileId })
      .select()
      .single()
    if (error) throw error
    return data as ContactInquiry
  },

  async getByProfile(profileId: string) {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as ContactInquiry[]
  },

  async markRead(id: string) {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw error
  },

  async getUnreadCount(profileId: string) {
    const { count, error } = await supabase
      .from('contact_inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .eq('is_read', false)
    if (error) throw error
    return count ?? 0
  },
}
