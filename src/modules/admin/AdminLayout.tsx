import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, MessageSquare, BarChart2, Image, ShieldCheck, LogOut, UserCircle, BadgeCheck, Trash2, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/utils/helpers'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'

const navItems = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Overview'     },
  { href: '/admin/creators',     icon: Users,           label: 'Creators'     },
  { href: '/admin/content',      icon: Image,           label: 'Content'      },
  { href: '/admin/inquiries',    icon: MessageSquare,   label: 'Inquiries'    },
  { href: '/admin/verification', icon: BadgeCheck,      label: 'Verification' },
  { href: '/admin/deletions',    icon: Trash2,          label: 'Deletions'    },
  { href: '/admin/analytics',    icon: BarChart2,       label: 'Analytics'    },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { profile, signOut } = useAuth()
  const [unread, setUnread]                 = useState(0)
  const [pendingVerif, setPendingVerif]     = useState(0)
  const [pendingDeletions, setPendingDeletions] = useState(0)
  const [sidebarOpen, setSidebarOpen]       = useState(false)

  useEffect(() => {
    supabase
      .from('contact_inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0))
    supabase
      .from('verification_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingVerif(count ?? 0))
    supabase
      .from('account_deletion_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingDeletions(count ?? 0))
  }, [])

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    navigate('/admin/login', { replace: true })
  }

  const SidebarContent = () => (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900 leading-tight">Showkase</p>
            <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">Founder Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = item.href === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-brand-50 text-brand-700' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn('w-4 h-4', active ? 'text-brand-600' : 'text-surface-400')} />
                {item.label}
              </div>
              {item.label === 'Inquiries' && unread > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
              {item.label === 'Verification' && pendingVerif > 0 && (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {pendingVerif}
                </span>
              )}
              {item.label === 'Deletions' && pendingDeletions > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {pendingDeletions}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Admin profile footer */}
      {profile && (
        <div className="px-3 py-3 border-t border-surface-100">
          <div className="flex items-center gap-2.5 px-1 py-1.5 rounded-xl hover:bg-surface-50 transition-colors">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-surface-900 truncate">{profile.full_name || profile.email}</p>
              <p className="text-[10px] text-surface-400 truncate">{profile.email}</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full shrink-0">
              {profile.role}
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link
              to="/admin/profile"
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all',
                location.pathname === '/admin/profile'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100',
              )}
            >
              <UserCircle className="w-3.5 h-3.5" />
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </aside>
  )

  return (
    <div className="h-screen overflow-hidden bg-surface-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 bg-white border-r border-surface-200 flex-col shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl h-full flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-100 text-surface-500"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-surface-200 h-14 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-surface-900">Showkase Admin</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
