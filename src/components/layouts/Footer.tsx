import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Showkase
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              The professional portfolio platform for UGC creators, influencers, and freelancers.
              Build your portfolio in minutes.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/explore"  className="hover:text-violet-600 transition-colors">Explore Creators</Link></li>
              <li><Link to="/register" className="hover:text-violet-600 transition-colors">Create Portfolio</Link></li>
              <li><Link to="/about"    className="hover:text-violet-600 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy"  className="hover:text-violet-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms"    className="hover:text-violet-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies"  className="hover:text-violet-600 transition-colors">Cookies Policy</Link></li>
              <li><Link to="/contact"  className="hover:text-violet-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Showkase. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-slate-400">
            Made with ❤️ by{' '}
            <a href="https://www.tmmt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-600 transition-colors">
              TMMT
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
