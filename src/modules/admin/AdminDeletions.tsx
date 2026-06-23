import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Trash2, Clock, CheckCircle2, XCircle, ExternalLink, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { timeAgo, cn } from '@/utils/helpers'

type DeletionRequest = {
  id: string
  profile_id: string
  user_id: string
  full_name: string
  username: string
  avatar_url: string | null
  email: string
  reason: string
  requested_at: string
  status: 'pending' | 'dismissed' | 'deleted'
}

type DeleteModal = { request: DeletionRequest; password: string; submitting: boolean; error: string }

type FilterTab = 'pending' | 'dismissed' | 'deleted' | 'all'
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'pending',   label: 'Pending'   },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'deleted',   label: 'Deleted'   },
  { key: 'all',       label: 'All'       },
]

export function AdminDeletions() {
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<FilterTab>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null)

  useEffect(() => {
    supabase
      .from('account_deletion_requests')
      .select('id, profile_id, reason, status, requested_at, profiles(full_name, username, avatar_url, email, user_id)')
      .order('requested_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const rows: DeletionRequest[] = (data ?? []).map((r: any) => ({
          id:           r.id,
          profile_id:   r.profile_id,
          user_id:      r.profiles?.user_id    ?? '',
          full_name:    r.profiles?.full_name  ?? '',
          username:     r.profiles?.username   ?? '',
          avatar_url:   r.profiles?.avatar_url ?? null,
          email:        r.profiles?.email      ?? '',
          reason:       r.reason ?? '',
          requested_at: r.requested_at,
          status:       r.status,
        }))
        setRequests(rows)
        setLoading(false)
      })
  }, [])

  const filtered = requests.filter(r => tab === 'all' || r.status === tab)
  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    dismissed: requests.filter(r => r.status === 'dismissed').length,
    deleted:   requests.filter(r => r.status === 'deleted').length,
  }

  async function dismiss(r: DeletionRequest) {
    const { error } = await supabase
      .from('account_deletion_requests')
      .update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
      .eq('id', r.id)
    if (error) { toast.error(error.message); return }
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'dismissed' } : x))
    toast.success('Request dismissed')
  }

  function openDeleteModal(r: DeletionRequest) {
    setDeleteModal({ request: r, password: '', submitting: false, error: '' })
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
          targetUserId: deleteModal.request.user_id,
          adminPassword: deleteModal.password,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setDeleteModal(m => m ? { ...m, submitting: false, error: json.error ?? 'Failed' } : null)
        return
      }
      // Mark request as deleted
      await supabase
        .from('account_deletion_requests')
        .update({ status: 'deleted', reviewed_at: new Date().toISOString() })
        .eq('id', deleteModal.request.id)
      setRequests(prev => prev.map(x => x.id === deleteModal.request.id ? { ...x, status: 'deleted' } : x))
      setDeleteModal(null)
      toast.success(`${deleteModal.request.full_name}'s account deleted`)
    } catch (e) {
      setDeleteModal(m => m ? { ...m, submitting: false, error: String(e) } : null)
    }
  }

  return (
    <>
      <Helmet><title>Deletion Requests — Admin</title></Helmet>
      <div className="p-6 space-y-4 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Account Deletion Requests</h1>
            <p className="text-sm text-surface-500 mt-0.5">Review and action creator deletion requests</p>
          </div>
          {counts.pending > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              <Clock className="w-3.5 h-3.5" />
              {counts.pending} pending
            </span>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',   value: counts.pending,   color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200'    },
            { label: 'Dismissed', value: counts.dismissed, color: 'text-surface-600', bg: 'bg-surface-50', border: 'border-surface-200' },
            { label: 'Deleted',   value: counts.deleted,   color: 'text-surface-900', bg: 'bg-surface-100',border: 'border-surface-300' },
          ].map(item => (
            <div key={item.label} className={cn('rounded-2xl border p-4 text-center', item.bg, item.border)}>
              <p className={cn('text-2xl font-black', item.color)}>{item.value}</p>
              <p className="text-xs text-surface-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
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
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center text-sm text-surface-400">
                No {tab === 'all' ? '' : tab} requests
              </div>
            ) : filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-50 transition-colors"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <Avatar src={r.avatar_url} name={r.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900">{r.full_name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">@{r.username} · {r.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-surface-400 hidden sm:block">{timeAgo(r.requested_at)}</span>
                    {r.status === 'pending' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {r.status === 'dismissed' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-surface-600 bg-surface-100 border border-surface-200 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Dismissed
                      </span>
                    )}
                    {r.status === 'deleted' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-surface-800 bg-surface-200 border border-surface-300 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Deleted
                      </span>
                    )}
                    <span className={cn('text-surface-400 text-xs transition-transform', expanded === r.id && 'rotate-180')}>▾</span>
                  </div>
                </div>

                {expanded === r.id && (
                  <div className="border-t border-surface-100 px-5 py-4 bg-surface-50 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-surface-500 mb-1">Reason provided</p>
                      <p className="text-sm text-surface-700 leading-relaxed">
                        {r.reason || <span className="italic text-surface-400">No reason given</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/${r.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Portfolio
                      </a>
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openDeleteModal(r)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Confirm & Delete Account
                          </button>
                          <button
                            onClick={() => dismiss(r)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 text-xs font-semibold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Dismiss Request
                          </button>
                        </>
                      )}
                      {r.status === 'dismissed' && (
                        <button
                          onClick={() => openDeleteModal(r)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Anyway
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete password modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-900">Delete Account</p>
                <p className="text-xs text-surface-400">{deleteModal.request.full_name}</p>
              </div>
            </div>
            <p className="text-xs text-surface-500">
              This is <span className="font-semibold text-red-600">permanent and irreversible</span>. Enter your admin password to confirm.
            </p>
            <div>
              <label className="text-xs font-medium text-surface-500 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Password
              </label>
              <input
                type="password"
                value={deleteModal.password}
                onChange={e => setDeleteModal(m => m ? { ...m, password: e.target.value, error: '' } : null)}
                onKeyDown={e => e.key === 'Enter' && confirmDelete()}
                placeholder="Enter your password"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
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
    </>
  )
}
