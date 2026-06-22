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
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464"/>
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
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: platform.color }}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="w-20 text-sm font-medium text-surface-700 shrink-0">{platform.label}</span>
        <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <span className="text-surface-400 shrink-0 select-none">{platform.prefill}</span>
          <input
            type="text"
            value={first ? getDisplay(first.url) : ''}
            onChange={e => { if (first) handleChange(first.id, e.target.value); else if (e.target.value) onAdd(platform.value) }}
            placeholder={platform.placeholder}
            className="flex-1 bg-transparent text-surface-900 placeholder:text-surface-400 focus:outline-none min-w-0"
          />
          {first && (
            <button onClick={() => onRemove(first.id)} className="ml-1 text-surface-300 hover:text-red-400 transition-colors shrink-0">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => onAdd(platform.value)}
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1.5 rounded-lg transition-colors border border-brand-200"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      {entries.slice(1).map((entry, idx) => (
        <div key={entry.id} className="flex items-center gap-3 mt-2 pl-10">
          <span className="w-20 text-xs text-surface-400 shrink-0">#{idx + 2}</span>
          <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
            <span className="text-surface-400 shrink-0 select-none">{platform.prefill}</span>
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
          <div className="w-14 shrink-0" />
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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#25D366' }}>
          <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-surface-700">WhatsApp</span>
      </div>
      <div className="flex items-center gap-3 pl-10 mb-2">
        <div className="flex items-center gap-1 w-20 shrink-0">
          <User className="w-3 h-3 text-surface-400" />
          <span className="text-xs text-surface-500">Personal</span>
        </div>
        <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <span className="text-surface-400 shrink-0 select-none">https://wa.me/</span>
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
      <div className="flex items-center gap-3 pl-10">
        <div className="flex items-center gap-1 w-20 shrink-0">
          <Users className="w-3 h-3 text-surface-400" />
          <span className="text-xs text-surface-500">Community</span>
        </div>
        <div className="flex-1 flex items-center rounded-lg border px-2 py-1.5 text-xs focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent border-surface-200 bg-surface-50">
          <input
            type="text"
            value={community[0]?.url ?? ''}
            onChange={e => { if (community[0]) onUpdate(community[0].id, e.target.value); else if (e.target.value) onAdd('whatsapp_community') }}
            placeholder="https://chat.whatsapp.com/your-community-link"
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
