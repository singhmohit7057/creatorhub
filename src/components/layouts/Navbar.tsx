import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { cn } from '@/utils/helpers'

const navLinks = [
  { href: '/',        label: 'Home' },
  { href: '/explore', label: 'Explore Creators' },
  { href: '/about',   label: 'About' },
]

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-surface-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Showkase
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-600',
                  location.pathname === link.href ? 'text-brand-600' : 'text-surface-600',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(p => !p)}
                  className="flex items-center gap-2 hover:bg-surface-100 rounded-xl px-2 py-1.5 transition-colors"
                >
                  <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                  <span className="hidden md:block text-sm font-medium text-surface-900 max-w-[120px] truncate">
                    {profile.full_name || profile.username}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-surface-200 shadow-card-hover py-1 z-20 animate-slide-down">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to={`/${profile.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50"
                      >
                        <User className="w-4 h-4" />
                        My Portfolio
                      </Link>
                      <div className="h-px bg-surface-100 my-1" />
                      <button
                        onClick={() => { signOut(); setDropdownOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="md" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="md" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100"
              onClick={() => setMenuOpen(p => !p)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-surface-100 py-3 space-y-1 animate-slide-down">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-surface-700 hover:text-brand-600 hover:bg-surface-50 rounded-xl"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="block text-center py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 rounded-xl">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-center py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl">Get Started Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
