import { useEffect, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Star, Ban, Trash2, BadgeCheck, X, ExternalLink, AlertTriangle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Skeleton } from '@/components/common/Skeleton'
import { timeAgo, cn } from '@/utils/helpers'
import type { Profile } from '@/types'

type FilterTab = 'all' | 'active' | 'suspended' | 'verified' | 'featured'

type SuspendModal = { creator: Profile; reason: string; submitting: boolean }
type DeleteModal  = { creator: Profile; password: string; submitting: boolean; error: string }

export function AdminCreators() {
  const [creators, setCreators] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState<FilterTab>('all')
  const [drawer, setDrawer]     = useState<Profile | null>(null)
  const [suspendModal, setSuspendModal] = useState<SuspendModal | null>(null)
  const [deleteModal, setDeleteModal]   = useState<DeleteModal | null>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => { setCreators((data as Profile[]) ?? []); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = creators
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    }
    if (tab === 'active')    list = list.filter(c => c.status === 'active')
    if (tab === 'suspended') list = list.filter(c => c.status === 'suspended')
    if (tab === 'verified')  list = list.filter(c => c.is_verified)
    if (tab === 'featured')  list = list.filter(c => c.is_featured)
    return list
  }, [creators, search, tab])

  function update(id: string, patch: Partial<Profile>) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    if (drawer?.id === id) setDrawer(prev => prev ? { ...prev, ...patch } : null)
  }

  async function toggleFeatured(c: Profile) {
    const { error } = await supabase.from('profiles').update({ is_featured: !c.is_featured }).eq('id', c.id)
    if (error) { toast.error('Failed'); return }
    update(c.id, { is_featured: !c.is_featured })
    toast.success(c.is_featured ? 'Unfeatured' : 'Featured!')
  }

  async function toggleVerified(c: Profile) {
    const { error } = await supabase.from('profiles').update({ is_verified: !c.is_verified }).eq('id', c.id)
    if (error) { toast.error('Failed'); return }
    update(c.id, { is_verified: !c.is_verified })
    toast.success(c.is_verified ? 'Verification removed' : 'Verified!')
  }

  function openSuspend(c: Profile) {
    if (c.status === 'suspended') {
      // Restore immediately — no modal needed
      restoreAccount(c)
    } else {
      setSuspendModal({ creator: c, reason: '', submitting: false })
    }
  }

  async function restoreAccount(c: Profile) {
    const { error } = await supabase.from('profiles').update({
      status: 'active',
      suspension_reason: null,
      is_published: true,
    }).eq('id', c.id)
    if (error) { toast.error('Failed'); return }
    update(c.id, { status: 'active', suspension_reason: null, is_published: true })
    toast.success('Account restored')
  }

  async function confirmSuspend() {
    if (!suspendModal) return
    setSuspendModal(m => m ? { ...m, submitting: true } : null)
    const { error } = await supabase.from('profiles').update({
      status: 'suspended',
      suspension_reason: suspendModal.reason.trim() || null,
      is_published: false,
    }).eq('id', suspendModal.creator.id)
    if (error) { toast.error('Failed'); setSuspendModal(m => m ? { ...m, submitting: false } : null); return }
    update(suspendModal.creator.id, {
      status: 'suspended',
      suspension_reason: suspendModal.reason.trim() || null,
      is_published: false,
    })
    setSuspendModal(null)
    toast.success('Account suspended')
  }

  function openDelete(c: Profile) {
    setDeleteModal({ creator: c, password: '', submitting: false, error: '' })
  }

  async function confirmDelete() {
    if (!deleteModal) return
    setDeleteModal(m => m ? { ...m, submitting: true, error: '' } : null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          targetUserId: deleteModal.creator.user_id,
          adminPassword: deleteModal.password,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setDeleteModal(m => m ? { ...m, submitting: false, error: json.error ?? 'Failed' } : null)
        return
      }
      setCreators(prev => prev.filter(x => x.id !== deleteModal.creator.id))
      if (drawer?.id === deleteModal.creator.id) setDrawer(null)
      setDeleteModal(null)
      toast.success(`${deleteModal.creator.full_name} deleted`)
    } catch (e) {
      setDeleteModal(m => m ? { ...m, submitting: false, error: String(e) } : null)
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: `All (${creators.length})` },
    { key: 'active',    label: 'Active' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'verified',  label: 'Verified' },
    { key: 'featured',  label: 'Featured' },
  ]

  return (
    <>
      <Helmet><title>Creators — Admin</title></Helmet>
      <div className="p-4 sm:p-6 space-y-4">

        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-surface-900">Creators</h1>
            <p className="text-sm text-surface-500 mt-0.5">Manage all creator accounts</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search name, username, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                tab === t.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-4 py-3 text-left font-medium text-surface-500">Creator</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden xl:table-cell">Last Active</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-surface-400">No creators found</td></tr>
                ) : filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setDrawer(c)}
                    className="hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={c.avatar_url} name={c.full_name} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-surface-900">{c.full_name || '(no name)'}</p>
                            {c.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-brand-500" />}
                          </div>
                          <p className="text-xs text-surface-400">@{c.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.category && <Badge variant="default">{c.category}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 hidden lg:table-cell">
                      {c.city || c.country
                        ? [c.city, c.country].filter(Boolean).join(', ')
                        : <span className="text-surface-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 hidden lg:table-cell">{timeAgo(c.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-surface-400 hidden xl:table-cell">{timeAgo(c.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.is_published ? <Badge variant="success">Live</Badge> : <Badge variant="default">Draft</Badge>}
                        {c.is_featured && <Badge variant="primary">Featured</Badge>}
                        {c.status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleFeatured(c)}
                          className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all', c.is_featured ? 'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100' : 'border-surface-200 text-surface-500 hover:border-yellow-200 hover:text-yellow-700 hover:bg-yellow-50')}>
                          <Star className="w-3 h-3" />{c.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button onClick={() => openSuspend(c)}
                          className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all', c.status === 'suspended' ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-surface-200 text-surface-500 hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50')}>
                          <Ban className="w-3 h-3" />{c.status === 'suspended' ? 'Restore' : 'Suspend'}
                        </button>
                        <button onClick={() => openDelete(c)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-surface-200 text-xs font-medium text-surface-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3 h-3" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-900">Suspend Account</p>
                <p className="text-xs text-surface-400">{suspendModal.creator.full_name}</p>
              </div>
            </div>
            <p className="text-xs text-surface-500">
              Portfolio will be unpublished and the creator will see a suspension notice in their settings.
            </p>
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1 block">Reason <span className="text-surface-300">(optional)</span></label>
              <textarea
                value={suspendModal.reason}
                onChange={e => setSuspendModal(m => m ? { ...m, reason: e.target.value } : null)}
                placeholder="e.g. Violation of community guidelines"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSuspendModal(null)}
                className="flex-1 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSuspend}
                disabled={suspendModal.submitting}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {suspendModal.submitting ? 'Suspending…' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-900">Delete Account</p>
                <p className="text-xs text-surface-400">{deleteModal.creator.full_name}</p>
              </div>
            </div>
            <p className="text-xs text-surface-500">
              This is <span className="font-semibold text-red-600">permanent and irreversible</span>. Enter your admin password to confirm.
            </p>
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1 block flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Password
              </label>
              <input
                type="password"
                value={deleteModal.password}
                onChange={e => setDeleteModal(m => m ? { ...m, password: e.target.value, error: '' } : null)}
                onKeyDown={e => e.key === 'Enter' && confirmDelete()}
                placeholder="Enter your password"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
              {deleteModal.error && (
                <p className="text-xs text-red-500 font-medium mt-1">{deleteModal.error}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteModal.submitting || !deleteModal.password}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {deleteModal.submitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white border-l border-surface-200 z-50 flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <p className="text-sm font-semibold text-surface-900">Creator Details</p>
              <button onClick={() => setDrawer(null)} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                <X className="w-4 h-4 text-surface-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Profile */}
              <div className="flex flex-col items-center text-center gap-2">
                <Avatar src={drawer.avatar_url} name={drawer.full_name} size="xl" />
                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="font-bold text-surface-900">{drawer.full_name}</p>
                    {drawer.is_verified && <BadgeCheck className="w-4 h-4 text-brand-500" />}
                  </div>
                  <p className="text-xs text-surface-500">@{drawer.username}</p>
                  {drawer.creator_title && <p className="text-xs text-surface-400 mt-0.5">{drawer.creator_title}</p>}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {drawer.is_published ? <Badge variant="success">Live</Badge> : <Badge variant="default">Draft</Badge>}
                  {drawer.is_featured && <Badge variant="primary">Featured</Badge>}
                  {drawer.status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                  {drawer.category && <Badge variant="default">{drawer.category}</Badge>}
                </div>
              </div>

              {/* Stats */}

              {/* Info */}
              <div className="space-y-2 text-sm">
                {drawer.bio && <p className="text-surface-600 text-xs leading-relaxed">{drawer.bio}</p>}
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span className="font-medium">Email:</span> {drawer.email}
                </div>
                {drawer.city && (
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <span className="font-medium">Location:</span> {drawer.city}, {drawer.country}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span className="font-medium">Joined:</span> {timeAgo(drawer.created_at)}
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span className="font-medium">Last Active:</span> {timeAgo(drawer.updated_at)}
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                  <span className="font-medium">Template:</span> <span className="capitalize">{drawer.template}</span>
                </div>
              </div>

            </div>

            {/* Drawer actions */}
            <div className="p-4 border-t border-surface-100 space-y-2">
              <a
                href={`/${drawer.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> View Portfolio
              </a>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => toggleFeatured(drawer)}
                  className={cn('py-2 rounded-xl text-xs font-semibold transition-all border', drawer.is_featured ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'border-surface-200 text-surface-600 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700')}>
                  {drawer.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button onClick={() => toggleVerified(drawer)}
                  className={cn('py-2 rounded-xl text-xs font-semibold transition-all border', drawer.is_verified ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-surface-200 text-surface-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700')}>
                  {drawer.is_verified ? 'Unverify' : 'Verify'}
                </button>
                <button onClick={() => openSuspend(drawer)}
                  className={cn('py-2 rounded-xl text-xs font-semibold transition-all border', drawer.status === 'suspended' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-surface-200 text-surface-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700')}>
                  {drawer.status === 'suspended' ? 'Restore' : 'Suspend'}
                </button>
              </div>
              {/* Role assignment */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-xs font-medium text-surface-500">Role</span>
                <div className="flex gap-1.5">
                  {(['creator', 'admin'] as const).map(role => (
                    <button
                      key={role}
                      onClick={async () => {
                        if (drawer.role === role) return
                        const { error } = await supabase.from('profiles').update({ role }).eq('id', drawer.id)
                        if (error) { toast.error('Failed'); return }
                        update(drawer.id, { role }); toast.success(`Role set to ${role}`)
                      }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all border',
                        drawer.role === role
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-surface-200 text-surface-500 hover:border-brand-300 hover:text-brand-600',
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => openDelete(drawer)}
                className="w-full py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
