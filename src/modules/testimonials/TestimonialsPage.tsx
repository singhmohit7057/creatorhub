import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { Plus, Trash2, Star, Pencil } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { testimonialService } from '@/services/testimonialService'
import { Input, Textarea } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import type { Testimonial } from '@/types'

const schema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  company:     z.string().optional(),
  review:      z.string().min(10, 'Review must be at least 10 characters'),
})
type FormData = z.infer<typeof schema>

export function TestimonialsPage() {
  const { profile, user } = useAuth()
  const [items, setItems]         = useState<Testimonial[]>([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Testimonial | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!profile) return
    testimonialService.getByProfile(profile.id)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [profile])

  function openAdd() {
    setEditing(null)
    reset({ client_name: '', company: '', review: '' })
    setAvatarFile(null)
    setModalOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditing(t)
    reset({ client_name: t.client_name, company: t.company ?? '', review: t.review })
    setAvatarFile(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function onSubmit(data: FormData) {
    if (!profile || !user) return
    try {
      if (editing) {
        const updated = await testimonialService.update(editing.id, {
          client_name: data.client_name,
          company:     data.company ?? null,
          review:      data.review,
        })
        setItems(prev => prev.map(t => t.id === editing.id ? updated : t))
        toast.success('Testimonial updated!')
      } else {
        const created = await testimonialService.create(
          profile.id, user.id,
          {
            client_name: data.client_name,
            company:     data.company ?? null,
            review:      data.review,
            avatar_url:  null,
            sort_order:  items.length,
          },
          avatarFile ?? undefined,
        )
        setItems(prev => [...prev, created])
        toast.success('Testimonial added!')
      }
      closeModal()
    } catch { toast.error(editing ? 'Failed to update' : 'Failed to add testimonial') }
  }

  async function handleDelete(id: string) {
    try {
      await testimonialService.delete(id)
      setItems(prev => prev.filter(t => t.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <>
      <Helmet><title>Testimonials — Showkase</title></Helmet>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Testimonials</h1>
            <p className="text-surface-500 text-sm mt-1">What brands say about working with you</p>
          </div>
          <Button size="md" onClick={openAdd} icon={<Plus className="w-4 h-4" />}>
            Add Testimonial
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Star className="w-8 h-8" />}
            title="No testimonials yet"
            description="Ask clients to leave a review and add them here"
            action={{ label: 'Add First Testimonial', onClick: openAdd }}
          />
        ) : (
          <div className="space-y-4">
            {items.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-surface-200 p-5">
                <div className="flex items-start gap-3">
                  <Avatar src={t.avatar_url} name={t.client_name} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-surface-900 text-sm">{t.client_name}</p>
                        {t.company && <p className="text-xs text-surface-400">{t.company}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEdit(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 text-sm font-medium transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-lg border border-surface-200 text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600 mt-2 italic">"{t.review}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Testimonial' : 'Add Testimonial'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input label="Client Name" placeholder="Jane Smith" error={errors.client_name?.message} required {...register('client_name')} />
          <Input label="Company / Brand" placeholder="Nike" {...register('company')} />

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Client Photo (optional)</label>
            <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] ?? null)} className="text-sm text-surface-600" />
          </div>

          <Textarea label="Review" placeholder="What did they say about working with you?" rows={4} error={errors.review?.message} required {...register('review')} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Cancel</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              {editing ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
