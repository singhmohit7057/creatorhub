import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { BadgeCheck, X, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Skeleton } from '@/components/common/Skeleton'
import { formatNumber, timeAgo, cn } from '@/utils/helpers'

type VerifRequest = {
  id: string; profile_id: string; full_name: string; username: string
  avatar_url: string | null; category: string | null; followers: number
  reason: string; requested_at: string; status: 'pending' | 'approved' | 'rejected'
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'pending',  label: 'Pending'  },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export function AdminVerification() {
  const [requests, setRequests] = useState<VerifRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<FilterTab>('pending')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    // Load from verification_requests table when it exists
    // For now, load profiles that have requested verification
    supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, category, is_verified')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(() => {
        setRequests([])
        setLoading(false)
      })
  }, [])

  const filtered = requests.filter(r => tab === 'all' || r.status === tab)

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  async function approve(r: VerifRequest) {
    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', r.profile_id)
    if (error) { toast.error(error.message); return }
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'approved' } : x))
    toast.success(`${r.full_name} verified!`)
  }

  async function reject(r: VerifRequest) {
    setRequests(prev => prev.map(x => x.id === r.id ? { ...x, status: 'rejected' } : x))
    toast.success('Request rejected')
  }

  return (
    <>
      <Helmet><title>Verification — Admin</title></Helmet>
      <div className="p-6 space-y-4 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Verification Requests</h1>
            <p className="text-sm text-surface-500 mt-0.5">Review and approve creator verification badges</p>
          </div>
          {counts.pending > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              {counts.pending} pending
            </span>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending',  value: counts.pending,  color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'  },
            { label: 'Approved', value: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200'    },
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

        {/* Requests list */}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-surface-900">{r.full_name}</p>
                      {r.status === 'approved' && <BadgeCheck className="w-4 h-4 text-brand-500" />}
                      {r.category && <Badge variant="default">{r.category}</Badge>}
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">@{r.username} · {formatNumber(r.followers)} followers</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-surface-400 hidden sm:block">{timeAgo(r.requested_at)}</span>
                    {r.status === 'pending' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {r.status === 'approved' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {r.status === 'rejected' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    <span className={cn('text-surface-400 transition-transform text-xs', expanded === r.id && 'rotate-180')}>▾</span>
                  </div>
                </div>

                {expanded === r.id && (
                  <div className="border-t border-surface-100 px-5 py-4 bg-surface-50 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-surface-500 mb-1">Reason provided by creator</p>
                      <p className="text-sm text-surface-700 leading-relaxed">{r.reason}</p>
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
                            onClick={() => approve(r)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                          >
                            <BadgeCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => reject(r)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {r.status === 'approved' && (
                        <button
                          onClick={() => reject(r)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Revoke Verification
                        </button>
                      )}

                      {r.status === 'rejected' && (
                        <button
                          onClick={() => approve(r)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" /> Approve Instead
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
    </>
  )
}
