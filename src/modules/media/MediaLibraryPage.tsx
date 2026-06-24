import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Trash2, Star, Image as ImageIcon, Video, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { mediaService } from '@/services/mediaService'
import { FileUploader } from '@/components/common/FileUploader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { cn, formatBytes } from '@/utils/helpers'
import {
  MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB,
  MAX_IMAGES_PER_CREATOR, MAX_VIDEOS_PER_CREATOR, MAX_PORTFOLIO_MEDIA,
  ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES,
} from '@/utils/constants'
import type { MediaFile } from '@/types'

export function MediaLibraryPage() {
  const { profile, user } = useAuth()
  const [media, setMedia]       = useState<MediaFile[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [tab, setTab]           = useState<'all' | 'image' | 'video'>('all')
  const [dragId, setDragId]     = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const savingOrder = useRef(false)

  const fetchMedia = useCallback(async () => {
    if (!profile) return
    const data = await mediaService.getByProfile(profile.id)
    setMedia(data.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return a.sort_order - b.sort_order
    }))
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  async function handleFiles(files: File[]) {
    if (!profile || !user) return

    const imageCount = media.filter(m => m.type === 'image').length
    const videoCount = media.filter(m => m.type === 'video').length

    const allowed = files.filter(f => {
      const isVideo = f.type.startsWith('video/')
      if (isVideo && videoCount >= MAX_VIDEOS_PER_CREATOR) {
        toast.error(`Max ${MAX_VIDEOS_PER_CREATOR} videos allowed`)
        return false
      }
      if (!isVideo && imageCount >= MAX_IMAGES_PER_CREATOR) {
        toast.error(`Max ${MAX_IMAGES_PER_CREATOR} images allowed`)
        return false
      }
      return true
    })

    if (!allowed.length) return
    setUploading(true)
    try {
      const results = await Promise.allSettled(
        allowed.map(f => mediaService.upload(profile.id, user.id, f))
      )
      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed    = results.filter(r => r.status === 'rejected').length
      if (succeeded) toast.success(`${succeeded} file${succeeded > 1 ? 's' : ''} uploaded!`)
      if (failed)    toast.error(`${failed} file${failed > 1 ? 's' : ''} failed`)
      await fetchMedia()
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(file: MediaFile) {
    const path = new URL(file.url).pathname.split('/object/public/media/')[1]
    try {
      await mediaService.delete(file.id, path)
      setMedia(prev => prev.filter(m => m.id !== file.id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function setCover(file: MediaFile) {
    const isCurrent = file.is_featured
    const updated = media.map(m => ({ ...m, is_featured: !isCurrent && m.id === file.id }))
    setMedia(updated)
    try {
      await Promise.all(media.map(m =>
        mediaService.update(m.id, { is_featured: !isCurrent && m.id === file.id })
      ))
      toast.success(isCurrent ? 'Cover removed' : '★ Set as portfolio cover')
    } catch { toast.error('Failed to update'); fetchMedia() }
  }

  // ── Drag-to-reorder (only within filtered view, only in 'all' tab) ──
  function onDragStart(id: string) { setDragId(id) }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== dragId) setDragOverId(id)
  }
  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const list = [...media]
    const fromIdx = list.findIndex(m => m.id === dragId)
    const toIdx   = list.findIndex(m => m.id === targetId)
    const [item]  = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, item)
    // Reassign sort_order (featured stays first but user can still move it)
    const reordered = list.map((m, i) => ({ ...m, sort_order: i + 1 }))
    setMedia(reordered)
    setDragId(null)
    setDragOverId(null)
    saveOrder(reordered)
  }

  async function saveOrder(list: MediaFile[]) {
    if (savingOrder.current) return
    savingOrder.current = true
    try {
      await Promise.all(list.map(m => mediaService.update(m.id, { sort_order: m.sort_order })))
    } catch { toast.error('Failed to save order') }
    finally { savingOrder.current = false }
  }

  const imageCount = media.filter(m => m.type === 'image').length
  const videoCount = media.filter(m => m.type === 'video').length
  const atImageLimit = imageCount >= MAX_IMAGES_PER_CREATOR
  const atVideoLimit = videoCount >= MAX_VIDEOS_PER_CREATOR
  const uploadsBlocked = atImageLimit && atVideoLimit

  // Portfolio: cover first, then next 5 by sort_order = 6 total shown
  const filtered = tab === 'all' ? media : media.filter(m => m.type === tab)

  return (
    <>
      <Helmet><title>Media Library — Showkase</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-surface-900">Media Library</h1>
          <p className="text-surface-500 text-sm mt-1">Upload and manage your portfolio images and videos</p>
        </div>

        {/* Upload area */}
        <div className="mb-4">
          <FileUploader
            onFiles={handleFiles}
            multiple
            disabled={uploading || uploadsBlocked}
            accept={{ 'image/*': ACCEPTED_IMAGE_TYPES, 'video/*': ACCEPTED_VIDEO_TYPES }}
            maxSize={Math.max(MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB) * 1024 * 1024}
            label={uploading ? 'Uploading...' : uploadsBlocked ? 'Upload limit reached' : 'Drop images & videos here'}
            hint={`Images up to ${MAX_IMAGE_SIZE_MB}MB · Videos up to ${MAX_VIDEO_SIZE_MB}MB`}
          />
        </div>

        {/* Usage counters */}
        <div className="flex items-center gap-4 mb-6">
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium',
            atImageLimit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-surface-50 border-surface-200 text-surface-600'
          )}>
            <ImageIcon className="w-3.5 h-3.5" />
            {imageCount}/{MAX_IMAGES_PER_CREATOR} images
            {atImageLimit && <span className="text-red-500 font-bold">· Full</span>}
          </div>
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium',
            atVideoLimit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-surface-50 border-surface-200 text-surface-600'
          )}>
            <Video className="w-3.5 h-3.5" />
            {videoCount}/{MAX_VIDEOS_PER_CREATOR} videos
            {atVideoLimit && <span className="text-red-500 font-bold">· Full</span>}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 bg-surface-50 text-xs font-medium text-surface-600">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            {Math.min(media.length, MAX_PORTFOLIO_MEDIA)}/{MAX_PORTFOLIO_MEDIA} shown on portfolio
          </div>
        </div>

        {/* Tabs + hint */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
            {[
              { key: 'all',   label: 'All',    count: media.length },
              { key: 'image', label: 'Images', count: media.filter(m => m.type === 'image').length },
              { key: 'video', label: 'Videos', count: media.filter(m => m.type === 'video').length },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === t.key ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700',
                )}>
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          {tab === 'all' && media.length > 1 && (
            <p className="text-xs text-surface-400 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" /> Drag to reorder
            </p>
          )}
        </div>

        {/* Legend */}
        {media.length > 0 && (
          <div className="flex items-center gap-4 mb-4 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> = Portfolio cover (shows first)
            </span>
            <span>First {MAX_PORTFOLIO_MEDIA} items (by order) shown on portfolio</span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={tab === 'video' ? <Video className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
            title={`No ${tab === 'all' ? 'media' : tab + 's'} yet`}
            description="Upload your best work to showcase in your portfolio"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((file, idx) => (
              <React.Fragment key={file.id}>
                {tab === 'all' && idx === MAX_PORTFOLIO_MEDIA && (
                  <div className="col-span-full flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-surface-200" />
                    <span className="text-xs font-medium text-surface-400 whitespace-nowrap">Not shown on portfolio</span>
                    <div className="flex-1 h-px bg-surface-200" />
                  </div>
                )}
              <div
                draggable={tab === 'all'}
                onDragStart={() => onDragStart(file.id)}
                onDragOver={e => onDragOver(e, file.id)}
                onDrop={() => onDrop(file.id)}
                onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                className={cn(
                  'relative group rounded-xl overflow-hidden aspect-square bg-surface-100 transition-all',
                  tab === 'all' && 'cursor-grab active:cursor-grabbing',
                  dragId === file.id && 'opacity-40 scale-95',
                  dragOverId === file.id && 'ring-2 ring-brand-500 ring-offset-2',
                  file.is_featured && 'ring-2 ring-yellow-400',
                )}
              >
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.title ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <video src={file.url} className="w-full h-full object-cover" />
                )}

                {/* Drag handle — top left, always visible */}
                {tab === 'all' && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="w-6 h-6 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                )}

                {/* Order badge */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-0 transition-opacity pointer-events-none">
                  <span className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-md">{idx + 1}</span>
                </div>

                {/* Cover badge */}
                {file.is_featured && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-yellow-900" /> Cover
                    </span>
                  </div>
                )}

                {/* Hover overlay — actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <button
                    onClick={() => setCover(file)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium',
                      file.is_featured
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/20 text-white hover:bg-yellow-500',
                    )}
                    title={file.is_featured ? 'Remove cover' : 'Set as portfolio cover'}
                  >
                    <Star className={cn('w-3.5 h-3.5', file.is_featured && 'fill-white')} />
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                      {formatBytes(file.size_bytes)}
                    </span>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
