import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Showkase</title>
        <meta name="description" content="Learn how Showkase collects, uses, and protects your personal data." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 py-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-100/70 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-100/70 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white border border-violet-100 shadow-sm flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 18, 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="prose prose-slate max-w-none">

          <p className="lead text-surface-600">
            At Showkase, we take your privacy seriously. This policy explains what data we collect, why we collect it, and how we protect it.
          </p>

          <h2>1. Information We Collect</h2>
          <h3>Information you provide</h3>
          <ul>
            <li>Account details: name, email address, password (hashed)</li>
            <li>Profile information: bio, profile photo, cover image, city, country, social links</li>
            <li>Portfolio content: media files, brand collaborations, testimonials, services</li>
            <li>Communications: messages sent via our Contact form</li>
          </ul>
          <h3>Information collected automatically</h3>
          <ul>
            <li>Portfolio view events (visitor ID, referrer, approximate country)</li>
            <li>Contact form submission events</li>
            <li>Browser type and device information (for analytics only)</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To operate and improve the Showkase platform</li>
            <li>To display your public portfolio to brands and visitors</li>
            <li>To send account-related notifications (e.g. new inquiry received)</li>
            <li>To provide portfolio analytics to you as the creator</li>
            <li>To respond to your support requests</li>
          </ul>

          <h2>3. Your Public Portfolio</h2>
          <p>
            When you publish your portfolio, the following information becomes publicly visible to anyone with your portfolio URL:
            your name, photo, bio, location, social links, portfolio stats, media, collaborations, testimonials, and services.
            You can unpublish your portfolio at any time from your dashboard settings.
          </p>

          <h2>4. Information Sharing</h2>
          <p>
            We do <strong>not</strong> sell your personal data to third parties. We share data only in the following limited cases:
          </p>
          <ul>
            <li><strong>Supabase</strong> — our database and authentication infrastructure provider</li>
            <li><strong>Vercel</strong> — our hosting and deployment provider</li>
            <li><strong>Legal requirements</strong> — if required by applicable law or valid legal process</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. If you delete your account, we will remove your personal data
            within 30 days, except where retention is required by law.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your portfolio data</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:privacy@showkase.io">privacy@showkase.io</a>.</p>

          <h2>7. Security</h2>
          <p>
            We use industry-standard security practices including encrypted connections (HTTPS), hashed passwords,
            and row-level security on our database. No system is 100% secure, but we take reasonable measures to protect your data.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Showkase is not intended for users under the age of 13. We do not knowingly collect personal data from children.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of significant changes via email or a notice on the platform.
            Continued use of Showkase after changes constitutes your acceptance.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about this Privacy Policy? Reach us at{' '}
            <a href="mailto:privacy@showkase.io">privacy@showkase.io</a> or via our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link to="/terms"   className="text-brand-600 hover:text-brand-700 font-medium">Terms of Service →</Link>
          <Link to="/cookies" className="text-brand-600 hover:text-brand-700 font-medium">Cookies Policy →</Link>
        </div>
      </div>
    </>
  )
}
