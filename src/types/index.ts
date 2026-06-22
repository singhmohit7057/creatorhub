// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type CreatorCategory =
  | 'fashion' | 'beauty' | 'lifestyle' | 'travel' | 'food'
  | 'fitness' | 'tech' | 'gaming' | 'education' | 'finance'
  | 'parenting' | 'other'

export type PortfolioTemplate = 'minimal' | 'modern-dark' | 'fashion-premium' | 'creative-grid'

export type ServiceType =
  | 'ugc_videos' | 'product_photography' | 'reels' | 'shorts'
  | 'product_reviews' | 'voice_overs' | 'brand_campaigns' | 'social_media_content'

export type MediaType = 'image' | 'video'

export type UserRole = 'creator' | 'admin'

export type AccountStatus = 'active' | 'suspended' | 'deleted'

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  user_id: string
  username: string
  full_name: string
  creator_title: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  city: string | null
  country: string | null
  languages: string[]
  email: string
  phone: string | null
  show_email: boolean
  show_phone: boolean
  is_verified: boolean
  role: UserRole
  status: AccountStatus
  category: CreatorCategory | null
  template: PortfolioTemplate
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

// ─── Portfolio Stats ──────────────────────────────────────────────────────────

export interface PortfolioStats {
  id: string
  profile_id: string
  followers: number | null
  monthly_reach: number | null
  avg_views: number | null
  engagement_rate: number | null
  collaborations_count: number | null
  updated_at: string
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export interface SocialLink {
  id: string
  profile_id: string
  platform: SocialPlatform
  url: string
  created_at: string
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook' | 'website' | 'snapchat' | 'whatsapp' | 'whatsapp_community'

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaFile {
  id: string
  profile_id: string
  type: MediaType
  url: string
  thumbnail_url: string | null
  title: string | null
  description: string | null
  size_bytes: number
  mime_type: string
  is_featured: boolean
  sort_order: number
  created_at: string
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface CreatorService {
  id: string
  profile_id: string
  service_type: ServiceType
  title: string
  description: string | null
  created_at: string
}

// ─── Brand Collaborations ─────────────────────────────────────────────────────

export type CollabContentType = 'post' | 'reel' | 'story'

export interface BrandCollaboration {
  id: string
  profile_id: string
  brand_name: string
  brand_logo_url: string | null
  content_type: CollabContentType | null
  cover_image_url: string | null
  post_url: string | null
  project_description: string | null
  campaign_results: string | null
  collaboration_date: string | null
  sort_order: number
  created_at: string
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string
  profile_id: string
  client_name: string
  company: string | null
  review: string
  avatar_url: string | null
  sort_order: number
  created_at: string
}

// ─── Contact Inquiries ────────────────────────────────────────────────────────

export interface ContactInquiry {
  id: string
  profile_id: string
  brand_name: string
  contact_person: string
  email: string
  budget: string | null
  project_details: string
  is_read: boolean
  created_at: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  id: string
  profile_id: string
  event_type: 'portfolio_view' | 'contact_submission' | 'social_click' | 'media_view'
  visitor_id: string | null
  referrer: string | null
  country: string | null
  created_at: string
}

export interface AnalyticsSummary {
  total_views: number
  unique_visitors: number
  contact_submissions: number
  views_this_week: number
  views_last_week: number
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number
  total_portfolios: number
  total_views: number
  total_media_uploads: number
  new_users_today: number
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface ContactInquiryForm {
  brand_name: string
  contact_person: string
  email: string
  budget?: string
  project_details: string
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  value: T
  label: string
  icon?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
