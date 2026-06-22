import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, X, Instagram, Youtube, Linkedin, Facebook, Globe, Users, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { socialService } from '@/services/socialService'
import { Button } from '@/components/common/Button'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/utils/helpers'
import type { SocialPlatform } from '@/types'

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  )
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.209-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.288.149-.195.044-.36.074-.509.074-.42 0-.599-.24-.645-.419-.058-.195-.104-.375-.133-.554-.045-.195-.105-.479-.164-.57-1.873-.283-2.906-.702-3.145-1.271-.03-.06-.045-.134-.045-.209-.015-.239.165-.465.42-.509 3.264-.54 4.73-3.879 4.79-4.014l.016-.029c.18-.345.21-.645.119-.869-.195-.434-.884-.658-1.333-.809-.135-.045-.254-.091-.345-.12C.374 9.23-.03 8.84 0 8.391c0-.359.285-.689.734-.838.15-.061.329-.09.51-.09.12 0 .3.016.464.104.373.181.732.285 1.032.3.23 0 .373-.044.432-.09l-.002-.058c-.106-1.629-.233-3.655.296-4.848C4.053 1.07 7.41.793 8.394.793l.06.001c.135-.015.285-.015.45-.015z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export const PLATFORMS: {
  value: SocialPlatform
  label: string
  placeholder: string
  prefill: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'instagram', label: 'Instagram', placeholder: 'yourusername',       prefill: 'https://instagram.com/', color: '#E1306C', icon: Instagram },
  { value: 'tiktok',    label: 'TikTok',    placeholder: '@yourusername',       prefill: 'https://tiktok.com/',    color: '#000000', icon: TikTokIcon },
  { value: 'youtube',   label: 'YouTube',   placeholder: '@yourchannel',        prefill: 'https://youtube.com/',   color: '#FF0000', icon: Youtube },
  { value: 'linkedin',  label: 'LinkedIn',  placeholder: 'yourprofile',         prefill: 'https://linkedin.com/in/', color: '#0077B5', icon: Linkedin },
  { value: 'facebook',  label: 'Facebook',  placeholder: 'yourpage',            prefill: 'https://facebook.com/', color: '#1877F2', icon: Facebook },
  { value: 'snapchat',  label: 'Snapchat',  placeholder: 'yourusername',        prefill: 'https://snapchat.com/add/', color: '#FFFC00', icon: SnapchatIcon },
  { value: 'website',   label: 'Website',   placeholder: 'yourwebsite.com',     prefill: 'https://',              color: '#6366f1', icon: Globe },
]

interface LinkEntry { id: string; platform: SocialPlatform; url: string }

function PlatformRow({ platform, entries, onAdd, onRemove, onUpdate, isLast }: {
  platform: typeof PLATFORMS[number]
  entries: LinkEntry[]
  onAdd: (p: SocialPlatform) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, url: string) => void
  isLast: boolean
}) {
  const Icon = platform.icon
  const first = entries[0]
  function getDisplay(url: string) { return url.startsWith(platform.prefill) ? url.slice(platform.prefill.length) : url }
  function handleChange(id: string, raw: string) { onUpdate(id, raw ? platform.prefill + raw : '') }

  return (
    <div className={cn('px-4 py-2.5', !isLast && 'border-b border-surface-100')}>
      {/* Top row: icon + label + Add button */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: platform.color }}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="flex-1 text-sm font-medium text-surface-700">{platform.label}</span>
        <button
          onClick={() => onAdd(platform.value)}
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1.5 rounded-lg transition-colors border border-brand-200"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      {/* Input row */}
      {first ? (
        <div className="flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <span className="text-surface-400 shrink-0 select-none hidden sm:inline">{platform.prefill}</span>
          <input
            type="text"
            value={getDisplay(first.url)}
            onChange={e => handleChange(first.id, e.target.value)}
            placeholder={platform.placeholder}
            className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
          />
          <button onClick={() => onRemove(first.id)} className="ml-1 text-surface-300 hover:text-red-400 transition-colors shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <span className="text-surface-400 shrink-0 select-none hidden sm:inline">{platform.prefill}</span>
          <input
            type="text"
            value=""
            onChange={e => { if (e.target.value) onAdd(platform.value) }}
            placeholder={platform.placeholder}
            className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
          />
        </div>
      )}
      {entries.slice(1).map((entry, idx) => (
        <div key={entry.id} className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-surface-400 shrink-0">#{idx + 2}</span>
          <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
            <span className="text-surface-400 shrink-0 select-none hidden sm:inline">{platform.prefill}</span>
            <input
              type="text"
              value={getDisplay(entry.url)}
              onChange={e => handleChange(entry.id, e.target.value)}
              placeholder={platform.placeholder}
              className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
            />
            <button onClick={() => onRemove(entry.id)} className="ml-1 text-surface-300 hover:text-red-400 transition-colors shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function WhatsAppRow({ entries, onAdd, onRemove, onUpdate }: {
  entries: LinkEntry[]
  onAdd: (p: SocialPlatform) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, url: string) => void
}) {
  const personal  = entries.filter(e => e.platform === 'whatsapp')
  const community = entries.filter(e => e.platform === 'whatsapp_community')
  return (
    <div className="px-4 py-2.5 border-b border-surface-100">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#25D366' }}>
          <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-surface-700">WhatsApp</span>
      </div>
      {/* Personal */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="flex items-center gap-1 w-20 shrink-0">
          <User className="w-3 h-3 text-surface-400" />
          <span className="text-xs text-surface-500">Personal</span>
        </div>
        <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <span className="text-surface-400 shrink-0 select-none hidden sm:inline">https://wa.me/</span>
          <input
            type="text"
            value={personal[0] ? personal[0].url.replace('https://wa.me/', '') : ''}
            onChange={e => {
              const full = e.target.value ? 'https://wa.me/' + e.target.value : ''
              if (personal[0]) onUpdate(personal[0].id, full); else if (e.target.value) onAdd('whatsapp')
            }}
            placeholder="919876543210"
            className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
          />
          {personal[0] && <button onClick={() => onRemove(personal[0].id)} className="ml-1 text-surface-300 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3" /></button>}
        </div>
      </div>
      {/* Community */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 w-20 shrink-0">
          <Users className="w-3 h-3 text-surface-400" />
          <span className="text-xs text-surface-500">Community</span>
        </div>
        <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <input
            type="text"
            value={community[0]?.url ?? ''}
            onChange={e => { if (community[0]) onUpdate(community[0].id, e.target.value); else if (e.target.value) onAdd('whatsapp_community') }}
            placeholder="https://chat.whatsapp.com/..."
            className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
          />
          {community[0] && <button onClick={() => onRemove(community[0].id)} className="ml-1 text-surface-300 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3" /></button>}
        </div>
      </div>
    </div>
  )
}

export function SocialLinksCard() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState<LinkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!profile) return
    socialService.getByProfile(profile.id).then(data => {
      setEntries(data.map(s => ({ id: s.id, platform: s.platform, url: s.url })))
    }).finally(() => setLoading(false))
  }, [profile])

  function addEntry(platform: SocialPlatform) { setEntries(prev => [...prev, { id: crypto.randomUUID(), platform, url: '' }]) }
  function removeEntry(id: string) { setEntries(prev => prev.filter(e => e.id !== id)) }
  function updateUrl(id: string, url: string) { setEntries(prev => prev.map(e => e.id === id ? { ...e, url } : e)) }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const valid = entries.filter(e => e.url.trim())
    try {
      await socialService.saveAll(profile.id, valid.map(e => ({ platform: e.platform, url: e.url })))
      toast.success('Social links saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const waEntries = entries.filter(e => e.platform === 'whatsapp' || e.platform === 'whatsapp_community')

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5">
      <p className="text-sm font-semibold text-surface-900 mb-4">Social Links</p>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-11 rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-surface-200 overflow-hidden">
          {PLATFORMS.map(platform => (
            <PlatformRow
              key={platform.value}
              platform={platform}
              entries={entries.filter(e => e.platform === platform.value)}
              onAdd={addEntry}
              onRemove={removeEntry}
              onUpdate={updateUrl}
              isLast={false}
            />
          ))}
          <WhatsAppRow entries={waEntries} onAdd={addEntry} onRemove={removeEntry} onUpdate={updateUrl} />
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-surface-100 flex justify-end">
        <Button loading={saving} onClick={handleSave}>Save Social Links</Button>
      </div>
    </div>
  )
}
