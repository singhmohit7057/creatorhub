import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, MailOpen, Building2, User, IndianRupee, Clock, Inbox, Reply, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { inquiryService } from '@/services/inquiryService'
import { cn, timeAgo } from '@/utils/helpers'
import type { ContactInquiry } from '@/types'


function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function openReply(inq: ContactInquiry) {
  const subject = encodeURIComponent(`Re: Collaboration with ${inq.brand_name}`)
  const body    = encodeURIComponent(`Hi ${inq.contact_person},\n\nThank you for reaching out!\n\n`)
  if (isMobile()) {
    window.location.href = `mailto:${inq.email}?subject=${subject}&body=${body}`
    return
  }
  const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(inq.email)}&su=${subject}&body=${body}`
  const w = 600, h = 600
  const left = Math.round((window.screen.width - w) / 2)
  const top  = Math.round((window.screen.height - h) / 2)
  window.open(url, 'gmail_compose', `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`)
}

function brandInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const BRAND_COLORS = [
  ['#f0fdf4', '#16a34a'],
  ['#fdf4ff', '#9333ea'],
  ['#fff7ed', '#ea580c'],
  ['#f0f9ff', '#0284c7'],
  ['#fef2f2', '#dc2626'],
  ['#fefce8', '#ca8a04'],
]

function brandColor(name: string) {
  const idx = name.charCodeAt(0) % BRAND_COLORS.length
  return BRAND_COLORS[idx]
}

export function InquiriesPage() {
  const { profile } = useAuth()
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [selected, setSelected]   = useState<ContactInquiry | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!profile) return
    inquiryService.getByProfile(profile.id)
      .then(setInquiries)
      .finally(() => setLoading(false))
  }, [profile])

  async function handleSelect(inquiry: ContactInquiry) {
    setSelected(inquiry)
    if (!inquiry.is_read) {
      setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, is_read: true } : i))
      await inquiryService.markRead(inquiry.id)
    }
  }

  const unread = inquiries.filter(i => !i.is_read).length

  return (
    <>
      <Helmet><title>Inquiries — Showkase</title></Helmet>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-surface-900">Inquiries</h1>
              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
                  {unread} new
                </span>
              )}
            </div>
            <p className="text-surface-500 text-sm mt-0.5">Brand collaboration requests from your portfolio</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-surface-200">
            <div className="text-center">
              <Inbox className="w-12 h-12 text-surface-200 mx-auto mb-3" />
              <h3 className="font-semibold text-surface-900 mb-1">No inquiries yet</h3>
              <p className="text-sm text-surface-400 max-w-xs">Brand inquiries submitted through your portfolio will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 flex-1 min-h-0">
            {/* ── Inbox list ── */}
            <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
              {inquiries.map(inq => {
                const [bg, text] = brandColor(inq.brand_name)
                const isActive = selected?.id === inq.id
                return (
                  <button
                    key={inq.id}
                    onClick={() => handleSelect(inq)}
                    className={cn(
                      'w-full text-left rounded-2xl border p-3.5 transition-all',
                      isActive
                        ? 'border-brand-300 bg-brand-50 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: bg, color: text }}
                      >
                        {brandInitials(inq.brand_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={cn('text-sm truncate', inq.is_read ? 'font-medium text-surface-700' : 'font-bold text-surface-900')}>
                            {inq.brand_name}
                          </p>
                          {!inq.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-surface-400">{inq.contact_person}</p>
                        <p className="text-xs text-surface-500 mt-1 line-clamp-2 leading-relaxed">{inq.project_details}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-surface-400">
                          <Clock className="w-3 h-3" />
                          {timeAgo(inq.created_at)}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── Detail panel ── */}
            <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-surface-200 flex-col min-h-0 overflow-hidden">
              {selected ? (
                <div className="flex flex-col h-full">
                  {/* Panel header */}
                  <div className="px-6 py-4 border-b border-surface-100 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const [bg, text] = brandColor(selected.brand_name)
                          return (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: bg, color: text }}>
                              {brandInitials(selected.brand_name)}
                            </div>
                          )
                        })()}
                        <div>
                          <h2 className="text-base font-bold text-surface-900">{selected.brand_name}</h2>
                          <p className="text-xs text-surface-400">{timeAgo(selected.created_at)}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-semibold',
                        selected.is_read ? 'bg-surface-100 text-surface-500' : 'bg-brand-100 text-brand-700',
                      )}>
                        {selected.is_read ? 'Read' : '● New'}
                      </span>
                    </div>
                  </div>

                  {/* Panel body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Info cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                          <User className="w-3.5 h-3.5" /> Contact Person
                        </div>
                        <p className="text-sm font-semibold text-surface-900">{selected.contact_person}</p>
                      </div>
                      <div className="bg-surface-50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </div>
                        <a href={`mailto:${selected.email}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 truncate block">
                          {selected.email}
                        </a>
                      </div>
                      <div className="bg-surface-50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-surface-400 mb-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Brand
                        </div>
                        <p className="text-sm font-semibold text-surface-900">{selected.brand_name}</p>
                      </div>
                      {selected.budget && (
                        <div className="bg-emerald-50 rounded-xl p-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-1.5">
                            <IndianRupee className="w-3.5 h-3.5" /> Budget
                          </div>
                          <p className="text-sm font-semibold text-emerald-700">{selected.budget}</p>
                        </div>
                      )}
                    </div>

                    {/* Project details */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-400 uppercase tracking-widest mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> Project Details
                      </div>
                      <div className="bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 border border-violet-100 rounded-xl p-4">
                        <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">
                          {selected.project_details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reply bar */}
                  <div className="px-6 py-4 border-t border-surface-100 shrink-0 bg-surface-50/50">
                    <button
                      onClick={() => openReply(selected)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      <Reply className="w-4 h-4" />
                      Reply via Email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                      <MailOpen className="w-8 h-8 text-surface-300" />
                    </div>
                    <p className="font-semibold text-surface-400 text-sm">Select an inquiry to read it</p>
                    <p className="text-xs text-surface-300 mt-1">Click any message on the left</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
