import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'

export function CookiesPage() {
  return (
    <>
      <Helmet>
        <title>Cookies Policy — Showkase</title>
        <meta name="description" content="Learn how Showkase uses cookies and similar technologies." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 py-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-100/70 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-100/70 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white border border-violet-100 shadow-sm flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-6 h-6 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Cookies Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 18, 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="prose prose-slate max-w-none">

          <p className="lead text-surface-600">
            This Cookies Policy explains what cookies are, how Showkase uses them, and how you can control them.
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help websites
            remember your preferences, keep you logged in, and understand how you use the platform.
            Similar technologies include localStorage and sessionStorage, which we also use.
          </p>

          <h2>2. Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <p>These are required for the platform to function and cannot be disabled.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>sb-auth-token</code></td>
                  <td>Supabase authentication session</td>
                  <td>Until sign out</td>
                </tr>
                <tr>
                  <td><code>sb-refresh-token</code></td>
                  <td>Keeps you logged in across sessions</td>
                  <td>30 days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Functional Storage</h3>
          <p>These are stored in your browser's localStorage to improve your experience.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>showkase_visitor_id</code></td>
                  <td>Anonymous visitor ID used for portfolio view analytics</td>
                  <td>Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Analytics</h3>
          <p>
            Showkase uses its own internal analytics (stored in our database) to show creators how many
            people viewed their portfolio. We do <strong>not</strong> use third-party analytics services
            like Google Analytics or Meta Pixel.
          </p>

          <h2>3. Third-Party Cookies</h2>
          <p>
            We use the following third-party services that may set their own cookies:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — sets authentication cookies for session management.
              See <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Supabase Privacy Policy</a>.
            </li>
            <li>
              <strong>Google Fonts</strong> — used to load the Inter typeface. Google may log the font request.
              See <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>.
            </li>
          </ul>

          <h2>4. How to Control Cookies</h2>
          <p>You can control cookies in your browser settings:</p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          </ul>
          <p>
            Note: disabling essential cookies will prevent you from logging in or using the platform.
          </p>

          <h2>5. Changes to This Policy</h2>
          <p>
            We may update this Cookies Policy as we change or add features to the platform.
            We will update the "Last updated" date at the top of this page when we do.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about cookies? Contact us at{' '}
            <a href="mailto:privacy@showkase.io">privacy@showkase.io</a> or via our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link to="/privacy" className="text-brand-600 hover:text-brand-700 font-medium">Privacy Policy →</Link>
          <Link to="/terms"   className="text-brand-600 hover:text-brand-700 font-medium">Terms of Service →</Link>
        </div>
      </div>
    </>
  )
}
