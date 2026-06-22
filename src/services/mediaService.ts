import { supabase } from '@/lib/supabase'
import type { MediaFile, MediaType } from '@/types'

export const mediaService = {
  async getByProfile(profileId: string, type?: MediaType) {
    let q = supabase
      .from('media_files')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })

    if (type) q = q.eq('type', type)

    const { data, error } = await q
    if (error) throw error
    return data as MediaFile[]
  },

  async upload(profileId: string, userId: string, file: File): Promise<MediaFile> {
    const isVideo = file.type.startsWith('video/')
    const type: MediaType = isVideo ? 'video' : 'image'
    const ext  = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

    const { data, error } = await supabase
      .from('media_files')
      .insert({
        profile_id:  profileId,
        type,
        url:         urlData.publicUrl,
        mime_type:   file.type,
        size_bytes:  file.size,
        sort_order:  Date.now(),
      })
      .select()
      .single()
    if (error) throw error
    return data as MediaFile
  },

  async delete(mediaId: string, storagePath: string) {
    await supabase.storage.from('media').remove([storagePath])
    const { error } = await supabase.from('media_files').delete().eq('id', mediaId)
    if (error) throw error
  },

  async update(mediaId: string, updates: Partial<Pick<MediaFile, 'title' | 'description' | 'is_featured' | 'sort_order'>>) {
    const { data, error } = await supabase
      .from('media_files')
      .update(updates)
      .eq('id', mediaId)
      .select()
      .single()
    if (error) throw error
    return data as MediaFile
  },

  async reorder(items: { id: string; sort_order: number }[]) {
    const updates = items.map(({ id, sort_order }) =>
      supabase.from('media_files').update({ sort_order }).eq('id', id)
    )
    await Promise.all(updates)
  },
}
