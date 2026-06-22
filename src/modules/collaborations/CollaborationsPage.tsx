import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Plus, Trash2, Briefcase, Pencil, Calendar, ExternalLink, ImageIcon, Film, BookImage, Clapperboard, Upload, X as XIcon, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { collaborationService } from '@/services/collaborationService'
import { statsService }         from '@/services/statsService'
import { serviceService }       from '@/services/serviceService'
import { Input, Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { SERVICES } from '@/utils/constants'
import { cn } from '@/utils/helpers'
import type { BrandCollaboration, CollabContentType, PortfolioStats, ServiceType } from '@/types'

// ── Collab form ───────────────────────────────────────────────
const collabSchema = z.object({
  brand_name:          z.string().min(1, 'Brand name is required'),
  content_type:        z.enum(['post', 'reel', 'story']).nullable().optional(),
  post_url:            z.string().url('Must be a valid URL').optional().or(z.literal('')),
  project_description: z.string().optional(),
  campaign_results:    z.string().optional(),
})
type CollabForm = z.infer<typeof collabSchema>

const statsSchema = z.object({
  followers:            z.coerce.number().min(0).optional(),
  monthly_reach:        z.coerce.number().min(0).optional(),
  avg_views:            z.coerce.number().min(0).optional(),
  engagement_rate:      z.coerce.number().min(0).max(100).optional(),
  collaborations_count: z.coerce.number().min(0).optional(),
})
type StatsForm = z.infer<typeof statsSchema>

const CONTENT_TYPES: { value: CollabContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'post',  label: 'Post',  icon: <ImageIcon className="w-4 h-4" /> },
  { value: 'reel',  label: 'Reel',  icon: <Film className="w-4 h-4" /> },
  { value: 'story', label: 'Story', icon: <BookImage className="w-4 h-4" /> },
]

function ImageUpload({
  label, hint, file, existingUrl, onChange, aspect = 'square',
}: {
  label: string
  hint?: string
  file: File | null
  existingUrl?: string | null
  onChange: (f: File | null) => void
  aspect?: 'square' | '9/16'
}) {
  const preview = file ? URL.createObjectURL(file) : existingUrl ?? null
  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <div className={cn(
        'relative rounded-xl border-2 border-dashed transition-all overflow-hidden',
        preview ? 'border-brand-300' : 'border-surface-200 hover:border-brand-300',
        aspect === '9/16' ? 'w-32 aspect-[9/16]' : 'h-20 w-20',
      )}>
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <label className="absolute inset-0 cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Replace
                </span>
              </div>
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-1 text-surface-400 hover:text-brand-500 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-[10px] font-medium">Upload</span>
            {hint && <span className="text-[10px] text-surface-300">{hint}</span>}
            <input type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
          </label>
        )}
      </div>
    </div>
  )
}

function ContentTypeBadge({ type }: { type: CollabContentType | null }) {
  if (!type) return null
  const item = CONTENT_TYPES.find(c => c.value === type)
  if (!item) return null
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      type === 'reel'  && 'bg-violet-50 text-violet-600',
      type === 'post'  && 'bg-blue-50 text-blue-600',
      type === 'story' && 'bg-pink-50 text-pink-600',
    )}>
      {item.icon} {item.label}
    </span>
  )
}

function formatCollabDate(d: string | null): string | null {
  if (!d) return null
  const parts = d.split('-')
  if (parts.length < 2) return d
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const month = months[parseInt(parts[1], 10) - 1]
  return month ? `${month} ${parts[0]}` : d
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

export function CollaborationsPage() {
  const { profile, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'collabs' | 'stats' | 'services'>('collabs')

  // ── Collabs state ──
  const [collabs, setCollabs]         = useState<BrandCollaboration[]>([])
  const [loadingCollabs, setLoadingCollabs] = useState(true)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<BrandCollaboration | null>(null)
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [coverFile, setCoverFile]     = useState<File | null>(null)
  const [dateMonth, setDateMonth]     = useState('')
  const [dateYear, setDateYear]       = useState('')
  const [contentType, setContentType] = useState<CollabContentType | null>(null)
  // Featured collab IDs — up to 6 shown first on portfolio
  const [featuredIds, setFeaturedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('showkase_featured_collabs') ?? '[]') } catch { return [] }
  })

  // ── Stats state ──
  const [, setStats]       = useState<PortfolioStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // ── Services state ──
  const [services, setServices]         = useState<ServiceType[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  const { register: rCollab, handleSubmit: hCollab, reset: resetCollab, formState: { errors, isSubmitting } } = useForm<CollabForm>({
    resolver: zodResolver(collabSchema),
  })
  const statsForm = useForm<StatsForm>({ resolver: zodResolver(statsSchema) })

  useEffect(() => {
    if (!profile) return

    collaborationService.getByProfile(profile.id).then(setCollabs).finally(() => setLoadingCollabs(false))

    statsService.getByProfile(profile.id)
      .then(s => {
        setStats(s)
        statsForm.reset({
          followers:            s.followers            ?? undefined,
          monthly_reach:        s.monthly_reach        ?? undefined,
          avg_views:            s.avg_views            ?? undefined,
          engagement_rate:      s.engagement_rate      ?? undefined,
          collaborations_count: s.collaborations_count ?? undefined,
        })
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false))

    serviceService.getByProfile(profile.id)
      .then(sv => setServices(sv.map(s => s.service_type)))
      .finally(() => setLoadingServices(false))
  }, [profile, statsForm])

  // ── Collab handlers ──
  function openAdd() {
    setEditing(null)
    resetCollab({ brand_name: '', content_type: null, post_url: '', project_description: '', campaign_results: '' })
    setLogoFile(null); setCoverFile(null); setContentType(null); setDateMonth(''); setDateYear('')
    setModalOpen(true)
  }

  function openEdit(collab: BrandCollaboration) {
    setEditing(collab)
    resetCollab({
      brand_name:          collab.brand_name,
      content_type:        collab.content_type ?? null,
      post_url:            collab.post_url ?? '',
      project_description: collab.project_description ?? '',
      campaign_results:    collab.campaign_results    ?? '',
    })
    setLogoFile(null); setCoverFile(null)
    setContentType(collab.content_type ?? null)
    if (collab.collaboration_date) {
      const [y, m] = collab.collaboration_date.split('-')
      setDateMonth(m ?? ''); setDateYear(y ?? '')
    } else { setDateMonth(''); setDateYear('') }
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  async function onSubmitCollab(data: CollabForm) {
    if (!profile || !user) return
    const collaboration_date = dateYear && dateMonth ? `${dateYear}-${dateMonth}-01` : null
    try {
      if (editing) {
        const updated = await collaborationService.update(editing.id, {
          brand_name: data.brand_name, content_type: contentType, post_url: data.post_url || null,
          project_description: data.project_description ?? null, campaign_results: data.campaign_results ?? null, collaboration_date,
        })
        setCollabs(prev => prev.map(c => c.id === editing.id ? updated : c))
        toast.success('Collaboration updated!')
      } else {
        const created = await collaborationService.create(profile.id, user.id, {
          brand_name: data.brand_name, brand_logo_url: null, content_type: contentType,
          cover_image_url: null, post_url: data.post_url || null,
          project_description: data.project_description ?? null, campaign_results: data.campaign_results ?? null,
          collaboration_date, sort_order: collabs.length,
        }, logoFile ?? undefined, coverFile ?? undefined)
        setCollabs(prev => [...prev, created])
        toast.success('Collaboration added!')
      }
      closeModal()
    } catch { toast.error(editing ? 'Failed to update' : 'Failed to add collaboration') }
  }

  async function handleDelete(id: string) {
    try {
      await collaborationService.delete(id)
      setCollabs(prev => prev.filter(c => c.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  // ── Featured collabs ──
  function toggleFeatured(id: string) {
    setFeaturedIds(prev => {
      let next: string[]
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id)
      } else {
        if (prev.length >= 6) { toast.error('Max 6 collabs can be featured'); return prev }
        next = [...prev, id]
      }
      try { localStorage.setItem('showkase_featured_collabs', JSON.stringify(next)) } catch {}
      return next
    })
  }

  // ── Stats handler ──
  async function saveStats(data: StatsForm) {
    if (!profile) return
    try { await statsService.upsert(profile.id, data); toast.success('Stats updated!') }
    catch { toast.error('Failed to save') }
  }

  // ── Services handler ──
  function toggleService(type: ServiceType) {
    setServices(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type])
  }
  async function saveServices() {
    if (!profile) return
    try { await serviceService.setAll(profile.id, services); toast.success('Services updated!') }
    catch { toast.error('Failed to save') }
  }

  const tabs = [
    { key: 'collabs',  label: 'Collaborations' },
    { key: 'stats',    label: 'Statistics' },
    { key: 'services', label: 'Services' },
  ] as const

  return (
    <>
      <Helmet><title>Collaborations — Showkase</title></Helmet>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Collaborations</h1>
            <p className="text-surface-500 text-sm mt-1">Manage your brand work, stats and services</p>
          </div>
          {activeTab === 'collabs' && (
            <Button size="md" onClick={openAdd} icon={<Plus className="w-4 h-4" />}>
              Add Collaboration
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Collaborations tab ── */}
        {activeTab === 'collabs' && (
          loadingCollabs ? (
            <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : collabs.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="w-8 h-8" />}
              title="No collaborations yet"
              description="Add brands you've worked with to build social proof"
              action={{ label: 'Add First Collaboration', onClick: openAdd }}
            />
          ) : (
            <>
              {/* Featured legend */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-surface-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  Star up to 6 collabs to show first on your portfolio
                </p>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  featuredIds.length === 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-surface-100 text-surface-500',
                )}>
                  {featuredIds.length}/6 featured
                </span>
              </div>
              <div className="space-y-3">
                {collabs.map(collab => {
                  const isFeatured = featuredIds.includes(collab.id)
                  return (
                    <div key={collab.id} className={cn(
                      'bg-white rounded-2xl border p-5 flex items-start gap-4 transition-colors',
                      isFeatured ? 'border-yellow-300 bg-yellow-50/40' : 'border-surface-200',
                    )}>
                      <div className="w-10 aspect-[9/16] rounded-xl bg-surface-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {collab.cover_image_url
                          ? <img src={collab.cover_image_url} alt={collab.brand_name} className="w-full h-full object-cover" />
                          : collab.brand_logo_url
                            ? <img src={collab.brand_logo_url} alt={collab.brand_name} className="w-full h-full object-contain p-1" />
                            : <Clapperboard className="w-5 h-5 text-surface-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-surface-900">{collab.brand_name}</p>
                          <ContentTypeBadge type={collab.content_type} />
                          {isFeatured && (
                            <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-yellow-900" /> Featured
                            </span>
                          )}
                        </div>
                        {collab.project_description && <p className="text-sm text-surface-500 mt-0.5 line-clamp-2">{collab.project_description}</p>}
                        {collab.campaign_results && <p className="text-xs text-green-600 font-medium mt-1">✓ {collab.campaign_results}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          {collab.collaboration_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-surface-400" />
                              <span className="text-xs text-surface-400">{formatCollabDate(collab.collaboration_date)}</span>
                            </div>
                          )}
                          {collab.post_url && (
                            <a href={collab.post_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700 font-medium">
                              <ExternalLink className="w-3 h-3" /> View Post
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleFeatured(collab.id)}
                          title={isFeatured ? 'Remove from featured' : 'Feature on portfolio'}
                          className={cn(
                            'p-2 rounded-lg border transition-colors',
                            isFeatured
                              ? 'bg-yellow-400 border-yellow-400 text-yellow-900 hover:bg-yellow-300'
                              : 'border-surface-200 text-surface-400 hover:border-yellow-300 hover:text-yellow-500 hover:bg-yellow-50',
                          )}
                        >
                          <Star className={cn('w-4 h-4', isFeatured && 'fill-yellow-900')} />
                        </button>
                        <button onClick={() => openEdit(collab)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 text-sm font-medium transition-colors">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(collab.id)} className="p-2 rounded-lg border border-surface-200 text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )
        )}

        {/* ── Statistics tab ── */}
        {activeTab === 'stats' && (
          loadingStats ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <form onSubmit={statsForm.handleSubmit(saveStats)} className="space-y-4">
              <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
                <p className="text-sm text-brand-600 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                  These stats are shown on your public portfolio to give brands a quick overview.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Total Followers"      type="number" min="0" placeholder="0" {...statsForm.register('followers')} />
                  <Input label="Monthly Reach"        type="number" min="0" placeholder="0" {...statsForm.register('monthly_reach')} />
                  <Input label="Avg. Video Views"     type="number" min="0" placeholder="0" {...statsForm.register('avg_views')} />
                  <Input label="Engagement Rate (%)"  type="number" min="0" max="100" step="0.01" placeholder="0.00" {...statsForm.register('engagement_rate')} />
                  <Input label="Collaborations Done"  type="number" min="0" placeholder="0" {...statsForm.register('collaborations_count')} />
                </div>
              </div>
              <Button type="submit" loading={statsForm.formState.isSubmitting}>Save Stats</Button>
            </form>
          )
        )}

        {/* ── Services tab ── */}
        {activeTab === 'services' && (
          loadingServices ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-surface-200 p-6">
                <p className="text-sm text-surface-500 mb-4">Select services you offer to brands.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SERVICES.map(svc => (
                    <button
                      key={svc.value}
                      type="button"
                      onClick={() => toggleService(svc.value)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all',
                        services.includes(svc.value) ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-300',
                      )}
                    >
                      <span className="text-lg">{svc.icon}</span>
                      <span className="text-xs font-medium text-surface-700">{svc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={saveServices}>Save Services</Button>
            </div>
          )
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Collaboration' : 'Add Brand Collaboration'} size="md">
        <form onSubmit={hCollab(onSubmitCollab)} className="p-6 space-y-4">
          {/* Brand Logo + Brand Name on one line */}
          <div className="flex items-center gap-3">
            <ImageUpload
              label="Logo"
              hint="1:1"
              file={logoFile}
              existingUrl={editing?.brand_logo_url}
              onChange={setLogoFile}
              aspect="square"
            />
            <div className="flex-1">
              <Input label="Brand Name" placeholder="Nike, Samsung, etc." error={errors.brand_name?.message} required {...rCollab('brand_name')} />
            </div>
          </div>

          {/* Left: content type (column) + link  |  Right: cover */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Content Type</label>
                <div className="flex flex-col gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct.value} type="button" onClick={() => setContentType(contentType === ct.value ? null : ct.value)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        contentType === ct.value
                          ? ct.value === 'reel' ? 'bg-violet-50 border-violet-300 text-violet-700'
                            : ct.value === 'post' ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-pink-50 border-pink-300 text-pink-700'
                          : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50',
                      )}
                    >
                      {ct.icon} {ct.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Link to Post / Reel" placeholder="https://instagram.com/p/..." error={errors.post_url?.message} {...rCollab('post_url')} />
            </div>
            <ImageUpload
              label="Cover"
              hint="9:16"
              file={coverFile}
              existingUrl={editing?.cover_image_url}
              onChange={setCoverFile}
              aspect="9/16"
            />
          </div>

          <Textarea label="Project Description" placeholder="What type of content did you create?" rows={3} {...rCollab('project_description')} />
          <Textarea label="Campaign Results" placeholder="e.g. 2M+ views, 15% engagement rate" rows={2} {...rCollab('campaign_results')} />

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Collaboration Date</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select value={dateMonth} onChange={e => setDateMonth(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-4 py-2.5 pr-9 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                </select>
                <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              </div>
              <div className="relative flex-1">
                <select value={dateYear} onChange={e => setDateYear(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-4 py-2.5 pr-9 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Cancel</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>{editing ? 'Save Changes' : 'Add Collaboration'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
