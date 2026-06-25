import type { CreatorCategory, PortfolioTemplate, ServiceType, SocialPlatform } from '@/types'

export const APP_NAME = 'Showkase'
export const APP_URL  = import.meta.env.VITE_APP_URL ?? 'https://showkase.io'

export const CREATOR_CATEGORIES: { value: CreatorCategory; label: string; emoji: string }[] = [
  { value: 'fashion',       label: 'Fashion',       emoji: '👗' },
  { value: 'beauty',        label: 'Beauty',        emoji: '💄' },
  { value: 'lifestyle',     label: 'Lifestyle',     emoji: '✨' },
  { value: 'travel',        label: 'Travel',        emoji: '✈️' },
  { value: 'food',          label: 'Food',          emoji: '🍕' },
  { value: 'fitness',       label: 'Fitness',       emoji: '💪' },
  { value: 'tech',          label: 'Tech',          emoji: '💻' },
  { value: 'gaming',        label: 'Gaming',        emoji: '🎮' },
  { value: 'education',     label: 'Education',     emoji: '📚' },
  { value: 'finance',       label: 'Finance',       emoji: '💰' },
  { value: 'parenting',     label: 'Parenting',     emoji: '👶' },
  { value: 'music',         label: 'Music',         emoji: '🎵' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { value: 'sports',        label: 'Sports',        emoji: '⚽' },
  { value: 'art',           label: 'Art',           emoji: '🎨' },
  { value: 'photography',   label: 'Photography',   emoji: '📷' },
  { value: 'comedy',        label: 'Comedy',        emoji: '😂' },
  { value: 'diy',           label: 'DIY',           emoji: '🔧' },
  { value: 'pets',          label: 'Pets',          emoji: '🐾' },
  { value: 'health',        label: 'Health',        emoji: '🏥' },
  { value: 'business',      label: 'Business',      emoji: '💼' },
  { value: 'automotive',    label: 'Automotive',    emoji: '🚗' },
  { value: 'nature',        label: 'Nature',        emoji: '🌿' },
  { value: 'motivation',    label: 'Motivation',    emoji: '🔥' },
  { value: 'other',         label: 'Other',         emoji: '🌟' },
]

export const PORTFOLIO_TEMPLATES: {
  value: PortfolioTemplate
  label: string
  description: string
  preview_color: string
}[] = [
  { value: 'minimal',          label: 'Minimal',         description: 'Clean, white space, timeless', preview_color: '#f8fafc' },
  { value: 'modern-dark',      label: 'Modern Dark',     description: 'Sleek dark theme, premium feel', preview_color: '#0f172a' },
  { value: 'fashion-premium',  label: 'Fashion Premium', description: 'Bold, editorial, high-fashion', preview_color: '#1a0a2e' },
  { value: 'creative-grid',    label: 'Creative Grid',   description: 'Gallery-first, visual storytelling', preview_color: '#fafafa' },
]

export const SERVICES: { value: ServiceType; label: string; icon: string; platform?: 'instagram' | 'youtube' | 'both' }[] = [
  { value: 'ugc_videos',           label: 'UGC Videos',            icon: '🎬' },
  { value: 'product_photography',  label: 'Product Photography',   icon: '📸' },
  { value: 'reels',                label: 'Reels',                 icon: '🎞️',  platform: 'instagram' },
  { value: 'shorts',               label: 'YouTube Shorts',        icon: '⚡',   platform: 'youtube' },
  { value: 'product_reviews',      label: 'Product Reviews',       icon: '⭐' },
  { value: 'voice_overs',          label: 'Voice Overs',           icon: '🎙️' },
  { value: 'brand_campaigns',      label: 'Brand Campaigns',       icon: '📢' },
  { value: 'social_media_content', label: 'Social Media Content',  icon: '📱' },
  { value: 'youtube_video',        label: 'YouTube Video',         icon: '▶️',   platform: 'youtube' },
  { value: 'youtube_integration',  label: 'YouTube Integration',   icon: '🔗',   platform: 'youtube' },
  { value: 'instagram_post',       label: 'Instagram Post',        icon: '🖼️',   platform: 'instagram' },
  { value: 'instagram_stories',    label: 'Instagram Stories',     icon: '⭕',   platform: 'instagram' },
  { value: 'live_streaming',       label: 'Live Streaming',        icon: '🔴',   platform: 'both' },
  { value: 'brand_ambassador',     label: 'Brand Ambassador',      icon: '🤝',   platform: 'both' },
  { value: 'affiliate_marketing',  label: 'Affiliate Marketing',   icon: '💸',   platform: 'both' },
]

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform
  label: string
  placeholder: string
  color: string
}[] = [
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourusername', color: '#E1306C' },
  { value: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@yourusername',   color: '#000000' },
  { value: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@yourchannel',   color: '#FF0000' },
  { value: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/yourprofile',color: '#0077B5' },
  { value: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/yourpage',      color: '#1877F2' },
  { value: 'website',   label: 'Website',   placeholder: 'https://yourwebsite.com',            color: '#6366f1' },
]

export const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Brazil', 'Japan', 'Singapore', 'UAE', 'Other',
]

export const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Spanish', 'French',
  'German', 'Japanese', 'Mandarin', 'Arabic', 'Portuguese', 'Other',
]

export const BUDGET_OPTIONS = [
  'Under ₹10,000',
  '₹10,000 – ₹25,000',
  '₹25,000 – ₹50,000',
  '₹50,000 – ₹1,00,000',
  'Above ₹1,00,000',
  'Let\'s discuss',
]

export const MAX_IMAGE_SIZE_MB = 10
export const MAX_VIDEO_SIZE_MB = 100
export const MAX_IMAGES_PER_CREATOR = 7
export const MAX_VIDEOS_PER_CREATOR = 2
export const MAX_PORTFOLIO_MEDIA    = 6
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime']
