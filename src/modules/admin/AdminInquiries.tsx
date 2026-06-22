import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ChevronUp, Mail, MailOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Skeleton } from '@/components/common/Skeleton'
import { timeAgo, cn } from '@/utils/helpers'
import type { ContactInquiry } from '@/types'

type InquiryRow = ContactInquiry & { creator_name: string; creator_username: string; creator_avatar: string | null }

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [filter, setFilter]       = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    supabase
      .from('contact_inquiries')
      .select('*, profiles(full_name, username, avatar_url)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []).map((row: any) => ({
          ...row,
          creator_name:     row.profiles?.full_name   ?? 'Unknown',
          creator_username: row.profiles?.username    ?? '',
          creator_avatar:   row.profiles?.avatar_url  ?? null,
        })) as InquiryRow[]
        setInquiries(rows)
        setLoading(false)
      })
  }, [])

  async function toggleRead(inq: InquiryRow) {
    const newVal = !inq.is_read
    const { error } = await supabase.from('contact_inquiries').update({ is_read: newVal }).eq('id', inq.id)
    if (error) { toast.error('Failed'); return }
    setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, is_read: newVal } : i))
  }

  const filtered = inquiries.filter(i =>
    filter === 'all' ? true : filter === 'unread' ? !i.is_read : i.is_read
  )
  const unreadCount = inquiries.filter(i => !i.is_read).length

  return (
    <>
      <Helmet><title>Inquiries — Admin</title></Helmet>
      <div className="p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900">Brand Inquiries</h1>
            <p className="text-sm text-surface-500 mt-0.5">All contact submissions across the platform</p>
          </div>
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600',
              )}
            >
              {f === 'all' ? `All (${inquiries.length})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${inquiries.length - unreadCount})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-surface-400 py-12">No inquiries found</p>
          ) : (
            <div className="divide-y divide-surface-100">
              {filtered.map(inq => (
                <div key={inq.id} className={cn('transition-colors', !inq.is_read && 'bg-brand-50/40')}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50 transition-colors"
                    onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                  >
                    {/* Creator */}
                    <div className="flex items-center gap-2.5 w-40 shrink-0">
                      <Avatar src={inq.creator_avatar} name={inq.creator_name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-surface-900 truncate">{inq.creator_name}</p>
                        <p className="text-[10px] text-surface-400">@{inq.creator_username}</p>
                      </div>
                    </div>

                    {/* Brand */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">{inq.brand_name}</p>
                      <p className="text-xs text-surface-400 truncate">{inq.contact_person} · {inq.email}</p>
                    </div>

                    {/* Budget */}
                    {inq.budget && (
                      <span className="hidden md:block text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
                        {inq.budget}
                      </span>
                    )}

                    {/* Date */}
                    <span className="text-xs text-surface-400 hidden lg:block shrink-0">{timeAgo(inq.created_at)}</span>

                    {/* Status + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      {inq.is_read
                        ? <Badge variant="default">Read</Badge>
                        : <Badge variant="primary">New</Badge>
                      }
                      {expanded === inq.id
                        ? <ChevronUp className="w-4 h-4 text-surface-400" />
                        : <ChevronDown className="w-4 h-4 text-surface-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded === inq.id && (
                    <div className="px-4 pb-4 pt-1 border-t border-surface-100 bg-surface-50/60">
                      <p className="text-xs font-semibold text-surface-600 mb-1.5">Project Details</p>
                      <p className="text-sm text-surface-700 leading-relaxed bg-white rounded-xl border border-surface-200 px-4 py-3">
                        {inq.project_details}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <a href={`mailto:${inq.email}`} className="text-xs text-brand-600 hover:underline font-medium">
                          Reply to {inq.contact_person} →
                        </a>
                        <button
                          onClick={() => toggleRead(inq)}
                          className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-brand-600 transition-colors"
                        >
                          {inq.is_read
                            ? <><Mail className="w-3.5 h-3.5" /> Mark as unread</>
                            : <><MailOpen className="w-3.5 h-3.5" /> Mark as read</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
