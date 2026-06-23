import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { GuestRoute }     from '@/routes/GuestRoute'
import { AdminRoute }     from '@/routes/AdminRoute'

// Layouts
import { PublicLayout }    from '@/components/layouts/PublicLayout'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'

// Public pages
import { HomePage }    from '@/pages/HomePage'
import { AboutPage }   from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { PrivacyPage }  from '@/pages/PrivacyPage'
import { TermsPage }    from '@/pages/TermsPage'
import { CookiesPage }  from '@/pages/CookiesPage'
import { NotFoundPage }from '@/pages/NotFoundPage'

// Auth pages
import { LoginPage }          from '@/pages/auth/LoginPage'
import { RegisterPage }       from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Dashboard pages
import { DashboardHome }           from '@/modules/dashboard/DashboardHome'
import { TemplatePage }            from '@/modules/portfolio/TemplatePage'
import { MediaLibraryPage }        from '@/modules/media/MediaLibraryPage'
import { CollaborationsPage }      from '@/modules/collaborations/CollaborationsPage'
import { TestimonialsPage }        from '@/modules/testimonials/TestimonialsPage'
import { AnalyticsPage }           from '@/modules/analytics/AnalyticsPage'
import { SettingsPage }            from '@/modules/settings/SettingsPage'
import { InquiriesPage }           from '@/modules/inquiries/InquiriesPage'

// Admin pages
import { AdminLayout }      from '@/modules/admin/AdminLayout'
import { AdminLoginPage }   from '@/modules/admin/AdminLoginPage'
import { AdminDashboard }   from '@/modules/admin/AdminDashboard'
import { AdminCreators }    from '@/modules/admin/AdminCreators'
import { AdminInquiries }   from '@/modules/admin/AdminInquiries'
import { AdminAnalytics }   from '@/modules/admin/AdminAnalytics'
import { AdminContent }      from '@/modules/admin/AdminContent'
import { AdminProfile }      from '@/modules/admin/AdminProfile'
import { AdminVerification } from '@/modules/admin/AdminVerification'
import { AdminDeletions }    from '@/modules/admin/AdminDeletions'

// Public portfolio
import { PublicPortfolioPage } from '@/pages/PublicPortfolioPage'
import { PublicMediaKitPage }  from '@/pages/PublicMediaKitPage'

// Dashboard — media kit
import { MediaKitPage } from '@/modules/mediakit/MediaKitPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Public routes with Navbar + Footer ── */}
          <Route element={<PublicLayout />}>
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms"   element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
          </Route>

          {/* ── Auth routes (redirect if already logged in) ── */}
          <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* ── Dashboard ── */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index                          element={<DashboardHome />} />
            <Route path="template"               element={<TemplatePage />} />
            <Route path="media"                   element={<MediaLibraryPage />} />
            <Route path="collaborations"          element={<CollaborationsPage />} />
            <Route path="testimonials"            element={<TestimonialsPage />} />
            <Route path="analytics"               element={<AnalyticsPage />} />
            <Route path="media-kit"              element={<MediaKitPage />} />
            <Route path="inquiries"               element={<InquiriesPage />} />
            <Route path="settings"                element={<SettingsPage />} />
          </Route>

          {/* ── Admin login (public) ── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index              element={<AdminDashboard />} />
            <Route path="creators"    element={<AdminCreators />} />
            <Route path="inquiries"   element={<AdminInquiries />} />
            <Route path="analytics"   element={<AdminAnalytics />} />
            <Route path="content"       element={<AdminContent />} />
            <Route path="verification" element={<AdminVerification />} />
            <Route path="deletions"    element={<AdminDeletions />} />
            <Route path="profile"      element={<AdminProfile />} />
          </Route>

          {/* ── Public portfolio (:username) ── */}
          <Route path="/:username" element={<PublicPortfolioPage />} />
          <Route path="/:username/media-kit" element={<PublicMediaKitPage />} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
