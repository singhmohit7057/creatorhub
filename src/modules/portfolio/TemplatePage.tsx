import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { CheckCircle2, Monitor, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { profileService } from '@/services/profileService'
import { PORTFOLIO_TEMPLATES } from '@/utils/constants'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/helpers'
import { APP_URL } from '@/utils/constants'
import type { PortfolioTemplate } from '@/types'

function TemplateThumbnail({ value }: { value: string }) {
  if (value === 'minimal') return (
    <div className="h-24 w-full bg-white relative overflow-hidden border-b border-surface-100">
      {/* top bar */}
      <div className="absolute top-0 inset-x-0 h-5 bg-white flex items-center justify-between px-2">
        <div className="w-3 h-3 rounded-full bg-indigo-500" />
        <div className="w-3 h-3 rounded-full bg-indigo-100" />
      </div>
      {/* cover gradient */}
      <div className="absolute top-5 inset-x-0 h-8 bg-gradient-to-r from-indigo-100 to-purple-100" />
      {/* avatar circle */}
      <div className="absolute top-7 left-3 w-7 h-7 rounded-full bg-indigo-400 border-2 border-white" />
      {/* name lines */}
      <div className="absolute top-16 left-3 right-3 space-y-1">
        <div className="h-1.5 w-20 rounded bg-gray-800" />
        <div className="h-1 w-14 rounded bg-gray-300" />
      </div>
    </div>
  )

  if (value === 'modern-dark') return (
    <div className="h-24 w-full bg-[#080c14] relative overflow-hidden">
      {/* top bar */}
      <div className="absolute top-0 inset-x-0 h-5 bg-[#080c14] flex items-center justify-between px-2">
        <div className="w-3 h-3 rounded-full bg-[#00f5d4]/20" />
        <div className="w-3 h-3 rounded-full bg-[#00f5d4]/20" />
      </div>
      {/* avatar + name */}
      <div className="absolute top-6 left-3 flex items-start gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#00f5d4]/20 border border-[#00f5d4]/40" />
        <div className="space-y-1 pt-0.5">
          <div className="h-1.5 w-16 rounded bg-white" />
          <div className="h-1 w-10 rounded bg-[#00f5d4]" />
        </div>
      </div>
      {/* stat grid */}
      <div className="absolute bottom-2 left-3 right-3 grid grid-cols-2 gap-px bg-slate-800 rounded overflow-hidden">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-[#0d1220] p-1">
            <div className="h-1.5 w-6 rounded mb-0.5" style={{ background: '#00f5d4' }} />
            <div className="h-0.5 w-8 rounded bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  )

  if (value === 'fashion-premium') return (
    <div className="h-24 w-full bg-[#fdf6f9] relative overflow-hidden">
      {/* top bar */}
      <div className="absolute top-0 inset-x-0 h-5 bg-[#fdf6f9] flex items-center justify-between px-2">
        <div className="w-3 h-3 rounded-full bg-pink-400" />
        <div className="w-3 h-3 rounded-full bg-pink-200" />
      </div>
      {/* gradient hero */}
      <div className="absolute top-5 inset-x-0 h-10 bg-gradient-to-br from-pink-900/30 via-purple-900/20 to-transparent" />
      {/* avatar centered */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-pink-300 border-2 border-pink-400/50" />
      {/* name lines centered */}
      <div className="absolute bottom-2 inset-x-0 flex flex-col items-center gap-1">
        <div className="h-1.5 w-16 rounded bg-gray-800" />
        <div className="h-1 w-10 rounded bg-pink-400" />
      </div>
    </div>
  )

  if (value === 'creative-grid') return (
    <div className="h-24 w-full bg-[#fafaf8] relative overflow-hidden">
      {/* top bar — two black dots */}
      <div className="absolute top-0 inset-x-0 h-4 bg-[#fafaf8] flex items-center justify-between px-2 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-black" />
        <div className="w-2.5 h-2.5 rounded-full bg-black" />
      </div>
      {/* split hero: photo left (dark), text panel right */}
      <div className="absolute top-4 inset-x-0 h-12 flex">
        {/* left — dark photo fill */}
        <div className="w-1/2 bg-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-800" />
          {/* silhouette hint */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 rounded-t-full bg-gray-400/60" />
        </div>
        {/* right — light info */}
        <div className="w-1/2 bg-[#fafaf8] px-2 pt-2 space-y-1 border-l border-gray-200">
          <div className="h-0.5 w-4 rounded bg-gray-300" />
          <div className="h-2 w-11 rounded bg-gray-900" />
          <div className="h-1 w-8 rounded bg-gray-400" />
          <div className="flex gap-1 mt-1">
            <div className="h-1.5 w-5 rounded-full bg-black" />
            <div className="h-1.5 w-4 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
      {/* bottom grid: 1 wide + 2 small */}
      <div className="absolute bottom-1 left-2 right-2 flex gap-1">
        <div className="h-5 flex-1 rounded-sm bg-gray-300" />
        <div className="flex flex-col gap-1">
          <div className="h-2 w-7 rounded-sm bg-gray-200" />
          <div className="h-2 w-7 rounded-sm bg-gray-400" />
        </div>
      </div>
    </div>
  )

  return <div className="h-24 w-full bg-surface-100" />
}

export function TemplatePage() {
  const { profile, refreshProfile } = useAuth()
  const [selected, setSelected] = useState<PortfolioTemplate>(
    (profile?.template as PortfolioTemplate) ?? 'minimal'
  )
  const [saving, setSaving] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (profile?.template) setSelected(profile.template as PortfolioTemplate)
  }, [profile?.template])

  async function applyTemplate() {
    if (!profile) return
    setSaving(true)
    try {
      await profileService.update(profile.id, { template: selected })
      await refreshProfile()
      toast.success('Template applied!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const active   = (profile?.template as PortfolioTemplate) ?? 'minimal'
  const username = profile?.username ?? 'democreator'
  const previewUrl = `/${username}?tpl=${selected}&preview=1`
  const portfolioUrl = `${APP_URL}/${username}?tpl=${selected}`

  return (
    <>
      <Helmet><title>Template — Showkase</title></Helmet>
      <div className="h-[calc(100vh-56px)] flex flex-col">

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-surface-900">Template</h1>
            <p className="text-surface-500 text-xs sm:text-sm mt-0.5 hidden sm:block">Choose how your public portfolio looks to brands</p>
          </div>
          <Button onClick={applyTemplate} loading={saving} disabled={selected === active} size="sm">
            {selected === active ? 'Applied' : 'Apply Template'}
          </Button>
        </div>

        {/* Mobile: horizontal template strip + live preview below */}
        <div className="flex-1 flex flex-col overflow-hidden lg:hidden">

          {/* Horizontal scrollable template picker */}
          <div className="shrink-0 bg-white border-b border-surface-200">
            <div
              className="flex gap-2.5 overflow-x-auto px-4 py-3 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {PORTFOLIO_TEMPLATES.map(tpl => {
                const isActive   = active === tpl.value
                const isSelected = selected === tpl.value
                return (
                  <button
                    key={tpl.value}
                    onClick={() => setSelected(tpl.value)}
                    className={cn(
                      'shrink-0 w-32 rounded-xl border-2 overflow-hidden text-left transition-all relative snap-start',
                      isSelected ? 'border-brand-500 shadow-sm' : 'border-surface-200',
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 drop-shadow-sm fill-white" />
                      </div>
                    )}
                    <TemplateThumbnail value={tpl.value} />
                    <div className="p-2 bg-white">
                      <p className="text-xs font-semibold text-surface-900">{tpl.label}</p>
                      {isActive && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live iframe preview */}
          <div className="flex-1 overflow-hidden bg-surface-100 flex flex-col">
            <div className="px-3 py-2 border-b border-surface-200 bg-white flex items-center gap-2 shrink-0">
              <Monitor className="w-3.5 h-3.5 text-surface-400" />
              <span className="text-xs text-surface-500 font-medium">
                Preview — {PORTFOLIO_TEMPLATES.find(t => t.value === selected)?.label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto flex items-start justify-center p-3">
              <div
                className="relative rounded-xl overflow-hidden shadow-xl border border-surface-300 bg-white"
                ref={el => {
                  if (!el) return
                  const pad = 24
                  const parentW = el.parentElement?.offsetWidth ?? 375
                  const availW  = parentW - pad
                  const scale   = Math.min(availW / 390, 1)
                  el.style.width  = `${390 * scale}px`
                  el.style.height = `${2400 * scale}px`
                  const iframe = el.querySelector('iframe') as HTMLIFrameElement | null
                  if (iframe) iframe.style.transform = `scale(${scale})`
                }}
              >
                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  title="Portfolio preview mobile"
                  className="border-0"
                  style={{
                    width:           '390px',
                    height:          '2400px',
                    transformOrigin: 'top left',
                    transform:       'scale(0.5)',
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Desktop: two-panel layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden">

          {/* Left — template list */}
          <div className="w-64 shrink-0 border-r border-surface-200 bg-white overflow-y-auto p-4 space-y-3">
            {PORTFOLIO_TEMPLATES.map(tpl => {
              const isActive   = active === tpl.value
              const isSelected = selected === tpl.value
              return (
                <button
                  key={tpl.value}
                  onClick={() => setSelected(tpl.value)}
                  className={cn(
                    'w-full rounded-xl border-2 overflow-hidden text-left transition-all relative',
                    isSelected ? 'border-brand-500 shadow-sm' : 'border-surface-200 hover:border-brand-300',
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 z-10">
                      <CheckCircle2 className="w-5 h-5 text-brand-500 drop-shadow-sm fill-white" />
                    </div>
                  )}
                  <TemplateThumbnail value={tpl.value} />
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-surface-900">{tpl.label}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{tpl.description}</p>
                    {isActive && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right — live iframe preview */}
          <div className="flex-1 bg-surface-100 overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-surface-200 bg-white flex items-center gap-2 shrink-0">
              <Monitor className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-500 font-medium">
                Preview — {PORTFOLIO_TEMPLATES.find(t => t.value === selected)?.label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-surface-300 bg-white"
                ref={el => {
                  if (!el) return
                  const pad = 48
                  const parentH = el.parentElement?.offsetHeight ?? 700
                  const availH  = parentH - pad
                  const scale   = Math.min(availH / 844, 1)
                  el.style.width  = `${390 * scale}px`
                  el.style.height = `${2400 * scale}px`
                  const iframe = el.querySelector('iframe') as HTMLIFrameElement | null
                  if (iframe) iframe.style.transform = `scale(${scale})`
                }}
              >
                <iframe
                  ref={iframeRef}
                  key={previewUrl}
                  src={previewUrl}
                  title="Portfolio preview"
                  className="border-0"
                  style={{
                    width:           '390px',
                    height:          '2400px',
                    transformOrigin: 'top left',
                    transform:       'scale(0.5)',
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
