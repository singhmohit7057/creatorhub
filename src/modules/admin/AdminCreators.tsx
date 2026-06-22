import { useEffect, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Star, Ban, Trash2, BadgeCheck, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Skeleton } from '@/components/common/Skeleton'
import { timeAgo, cn } from '@/utils/helpers'
import type { Profile } from '@/types'

type FilterTab = 'all' | 'active' | 'suspended' | 'verified' | 'featured'

export function AdminCreators() {
  const [creators, setCreators] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState<FilterTab>('all')
  const [drawer, setDrawer]     = useState<Profile | null>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
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

  async function toggleSuspend(c: Profile) {
    const newStatus = c.status === 'suspended' ? 'active' : 'suspended'
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', c.id)
    if (error) { toast.error('Failed'); return }
    update(c.id, { status: newStatus })
    toast.success(newStatus === 'suspended' ? 'Account suspended' : 'Account restored')
  }

  async function deleteCreator(c: Profile) {
    if (!confirm(`Delete ${c.full_name}? This cannot be undone.`)) return
    const { error } = await supabase.auth.admin.deleteUser(c.user_id)
    if (error) { toast.error(error.message); return }
    setCreators(prev => prev.filter(x => x.id !== c.id))
    setDrawer(null)
    toast.success('Deleted')
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
      <div className="p-6 space-y-4">

        {/* Header + Search */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Creators</h1>
            <p className="text-sm text-surface-500 mt-0.5">Manage all creator accounts</p>
          </div>
          <div className="relative w-64">
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
                  <th className="px-4 py-3 text-left font-medium text-surface-500 hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-surface-400">No creators found</td></tr>
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
                    <td className="px-4 py-3 text-xs text-surface-400 hidden lg:table-cell">{timeAgo(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.is_published ? <Badge variant="success">Live</Badge> : <Badge variant="default">Draft</Badge>}
                        {c.is_featured && <Badge variant="primary">Featured</Badge>}
                        {c.status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleFeatured(c)} title={c.is_featured ? 'Unfeature' : 'Feature'}
                          className={cn('p-1.5 rounded-lg transition-colors', c.is_featured ? 'text-yellow-500 bg-yellow-50' : 'text-surface-400 hover:text-yellow-500 hover:bg-yellow-50')}>
                          <Star className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleVerified(c)} title={c.is_verified ? 'Remove verification' : 'Verify'}
                          className={cn('p-1.5 rounded-lg transition-colors', c.is_verified ? 'text-brand-500 bg-brand-50' : 'text-surface-400 hover:text-brand-500 hover:bg-brand-50')}>
                          <BadgeCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleSuspend(c)} title={c.status === 'suspended' ? 'Restore' : 'Suspend'}
                          className={cn('p-1.5 rounded-lg transition-colors', c.status === 'suspended' ? 'text-amber-600 bg-amber-50' : 'text-surface-400 hover:text-amber-600 hover:bg-amber-50')}>
                          <Ban className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCreator(c)} title="Delete"
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
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

      {/* Detail Drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-surface-200 z-50 flex flex-col shadow-2xl">
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
                <button onClick={() => toggleSuspend(drawer)}
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
              <button onClick={() => deleteCreator(drawer)}
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
