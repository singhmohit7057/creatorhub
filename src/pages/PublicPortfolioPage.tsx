import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { profileService }       from '@/services/profileService'
import { socialService }        from '@/services/socialService'
import { mediaService }         from '@/services/mediaService'
import { statsService }         from '@/services/statsService'
import { collaborationService } from '@/services/collaborationService'
import { testimonialService }   from '@/services/testimonialService'
import { serviceService }       from '@/services/serviceService'
import { inquiryService }       from '@/services/inquiryService'
import { analyticsService }     from '@/services/analyticsService'
import { Button } from '@/components/common/Button'
import { SkeletonProfile } from '@/components/common/Skeleton'
import { APP_URL } from '@/utils/constants'
import type {
  Profile, SocialLink, MediaFile, PortfolioStats,
  BrandCollaboration, Testimonial, CreatorService,
} from '@/types'
import { THEME_COMPONENTS } from '@/themes'
import type { InquiryFormData } from '@/themes/_shared'

export function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>()
  const [searchParams] = useSearchParams()
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [socials,      setSocials]      = useState<SocialLink[]>([])
  const [media,        setMedia]        = useState<MediaFile[]>([])
  const [stats,        setStats]        = useState<PortfolioStats | null>(null)
  const [collabs,      setCollabs]      = useState<BrandCollaboration[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [services,     setServices]     = useState<CreatorService[]>([])
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)

  const isPreview = searchParams.get('preview') === '1'

  useEffect(() => {
    if (!username) return
    ;(async () => {
      try {
        const p = await profileService.getByUsername(username)
        if (!p.is_published && !isPreview) { setNotFound(true); return }
        setProfile(p)
        if (!isPreview) analyticsService.trackView(p.id)
        const [s, m, st, c, t, sv] = await Promise.all([
          socialService.getByProfile(p.id),
          mediaService.getByProfile(p.id),
          statsService.getByProfile(p.id).catch(() => null),
          collaborationService.getByProfile(p.id),
          testimonialService.getByProfile(p.id),
          serviceService.getByProfile(p.id),
        ])
        setSocials(s); setMedia(m); setStats(st)
        setCollabs(c); setTestimonials(t); setServices(sv)
      } catch { setNotFound(true) }
      finally  { setLoading(false) }
    })()
  }, [username])

  async function onInquiry(data: InquiryFormData) {
    try {
      await inquiryService.submit(profile!.id, data)
      await analyticsService.trackContactSubmission(profile!.id)
      toast.success('Inquiry sent!')
    } catch { toast.error('Failed to send') }
  }

  function onSocialClick(profileId: string, platform: string) {
    analyticsService.trackSocialClick(profileId, platform)
  }

  if (loading) return <div className="max-w-3xl mx-auto p-4 mt-8"><SkeletonProfile /></div>
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-surface-500 mb-6">This profile doesn't exist or isn't published yet.</p>
        <Link to="/explore"><Button>Explore Creators</Button></Link>
      </div>
    </div>
  )
  if (!profile) return null

  const p = profile
  const tpl = searchParams.get('tpl') ?? p.template ?? 'minimal'
  const ThemeComponent = THEME_COMPONENTS[tpl] ?? THEME_COMPONENTS['minimal']

  return (
    <>
      <Helmet>
        <title>{p.full_name} — {p.creator_title ?? 'Creator'} | Showkase</title>
        <meta name="description"        content={p.bio ?? `${p.full_name}'s creator portfolio`} />
        <meta property="og:title"       content={`${p.full_name} | Showkase`} />
        <meta property="og:description" content={p.bio ?? ''} />
        <meta property="og:image"       content={p.avatar_url ?? ''} />
        <meta property="og:url"         content={`${APP_URL}/${p.username}`} />
        <meta name="twitter:card"       content="summary_large_image" />
      </Helmet>
      <ThemeComponent
        profile={p}
        socials={socials}
        media={media}
        stats={stats}
        collabs={collabs}
        testimonials={testimonials}
        services={services}
        onInquiry={onInquiry}
        onSocialClick={onSocialClick}
      />
    </>
  )
}
