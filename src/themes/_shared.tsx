import type { ReactNode } from 'react'
import { Instagram, Youtube, Facebook, Linkedin, Globe, Asterisk, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type {
  Profile, SocialLink, MediaFile, PortfolioStats,
  BrandCollaboration, Testimonial, CreatorService,
} from '@/types'

export const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E1306C', tiktok: '#010101', youtube: '#FF0000',
  linkedin: '#0077B5', facebook: '#1877F2', website: '#6366f1', snapchat: '#FFFC00',
}
export const SOCIAL_TEXT: Record<string, string> = {
  instagram: 'white', tiktok: 'white', youtube: 'white',
  linkedin: 'white', facebook: 'white', website: 'white', snapchat: '#000',
}
export const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
    </svg>
  ),
  youtube:  <Youtube className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  website:  <Globe className="w-4 h-4" />,
  snapchat: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 2c.734 0 3.244.204 4.442 2.835.39.872.297 2.354.222 3.574l-.006.108c-.004.071-.008.14-.011.208.234-.045.48-.114.696-.227.107-.057.232-.086.356-.077.243.017.46.155.55.358.094.208.04.44-.142.6-.018.016-.036.03-.055.044-.568.42-1.17.632-1.808.63a4.43 4.43 0 01-.357-.025c.044.283.094.566.156.845.26 1.156.733 2.2 1.456 3.084a5.11 5.11 0 001.07.942c.297.188.474.504.47.843-.003.285-.136.547-.36.718-.204.155-.449.235-.696.235-.096 0-.193-.012-.287-.036-.53-.135-1.055-.203-1.568-.203-.343 0-.68.03-1.01.09-.615.11-1.16.401-1.64.784-.478.383-.888.855-1.225 1.38-.153.235-.4.36-.65.36-.25 0-.498-.125-.65-.36a6.896 6.896 0 00-1.226-1.38c-.48-.383-1.024-.673-1.64-.784a6.62 6.62 0 00-1.01-.09c-.513 0-1.037.068-1.567.203-.094.024-.191.036-.288.036-.246 0-.491-.08-.695-.235-.225-.171-.357-.433-.36-.718-.005-.34.172-.655.47-.843a5.11 5.11 0 001.07-.942c.722-.884 1.196-1.928 1.455-3.084.063-.279.113-.562.157-.845a4.43 4.43 0 01-.358.025c-.637.002-1.24-.21-1.807-.63-.019-.014-.037-.028-.055-.044-.183-.16-.237-.392-.143-.6.09-.203.307-.34.55-.358.124-.009.249.02.356.077.217.113.463.182.697.227l-.012-.208c-.074-1.22-.167-2.702.223-3.574C8.756 2.204 11.267 2 12.002 2h.015z"/>
    </svg>
  ),
}

export function TopBar({ pageBg, btnBg, iconColor }: {
  pageBg: string
  btnBg: string
  iconColor: string
}) {
  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
    }
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
      style={{ background: pageBg }}>
      <Link to="/">
        <button className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
          style={{ background: btnBg }}>
          <Asterisk className="w-5 h-5" style={{ color: iconColor }} />
        </button>
      </Link>
      <button onClick={handleShare}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
        style={{ background: btnBg }}>
        <Share2 className="w-4 h-4" style={{ color: iconColor }} />
      </button>
    </div>
  )
}

export const inquirySchema = z.object({
  brand_name:      z.string().min(1, 'Required'),
  contact_person:  z.string().min(1, 'Required'),
  email:           z.string().email('Invalid email'),
  budget:          z.string().optional(),
  project_details: z.string().min(10, 'Please describe the project'),
})
export type InquiryFormData = z.infer<typeof inquirySchema>

export type ThemeProps = {
  profile:      Profile
  socials:      SocialLink[]
  media:        MediaFile[]
  stats:        PortfolioStats | null
  collabs:      BrandCollaboration[]
  testimonials: Testimonial[]
  services:     CreatorService[]
  onInquiry:    (data: InquiryFormData) => Promise<void>
  onSocialClick:(profileId: string, platform: string) => void
}
