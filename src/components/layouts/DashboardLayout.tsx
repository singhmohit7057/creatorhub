import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Image, Briefcase, Star,
  BarChart2, Settings, Sparkles, Menu, Bell, ExternalLink, Mail, Palette, FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { inquiryService } from '@/services/inquiryService'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/utils/helpers'

const navItems = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/collaborations', icon: Briefcase,       label: 'Collaborations' },
  { href: '/dashboard/testimonials',   icon: Star,            label: 'Testimonials' },
  { href: '/dashboard/template',       icon: Palette,         label: 'Template' },
  { href: '/dashboard/inquiries',      icon: Mail,            label: 'Inquiries' },
  { href: '/dashboard/media',          icon: Image,           label: 'Media' },
  { href: '/dashboard/media-kit',      icon: FileText,        label: 'Media Kit', badge: 'Beta' },
  { href: '/dashboard/analytics',      icon: BarChart2,       label: 'Analytics' },
  { href: '/dashboard/settings',       icon: Settings,        label: 'Settings' },
]

export function DashboardLayout() {
  const { profile } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    inquiryService.getUnreadCount(profile.id).then(setUnreadCount)
  }, [profile])

  // Clear badge when user visits inquiries page
  useEffect(() => {
    if (location.pathname === '/dashboard/inquiries') setUnreadCount(0)
  }, [location.pathname])

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 h-14 flex items-center border-b border-surface-100">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-surface-900">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          Showkase
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          const isInquiries = item.href === '/dashboard/inquiries'
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand-600' : 'text-surface-400')} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-semibold leading-none">
                  {item.badge}
                </span>
              )}
              {isInquiries && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold leading-none">
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Profile section */}
      {profile && (
        <div className="px-4 py-4 border-t border-surface-100">
          {profile.is_published && (
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-brand-600 font-medium mb-3 hover:text-brand-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Portfolio
            </a>
          )}
          <div className="flex items-center gap-3">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{profile.full_name || 'Creator'}</p>
              <p className="text-xs text-surface-400 truncate">@{profile.username}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 bg-white border-r border-surface-200 flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl animate-slide-up">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-surface-200 h-14 flex items-center px-4 gap-3 shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {profile && (
            <>
              <Link to="/dashboard/inquiries" className="relative p-2 rounded-lg hover:bg-surface-100 text-surface-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
                )}
              </Link>
              <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            </>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
