import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — Showkase</title>
        <meta name="description" content="Read the Showkase Terms of Service — the rules and guidelines for using our platform." />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 py-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-100/70 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-pink-100/70 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white border border-violet-100 shadow-sm flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: June 18, 2025</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="prose prose-slate max-w-none">

          <p className="lead text-surface-600">
            By accessing or using Showkase, you agree to these Terms of Service. Please read them carefully.
            If you do not agree, please do not use the platform.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms govern your use of Showkase (showkase.io), operated by the Showkase team.
            By creating an account or using any part of the platform, you agree to be bound by these Terms
            and our <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <h2>2. Your Account</h2>
          <ul>
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must not share your login details or allow others to access your account.</li>
            <li>You must be at least 13 years old to create an account.</li>
            <li>One person may only maintain one free account.</li>
          </ul>

          <h2>3. Your Username</h2>
          <p>
            Your username becomes your public portfolio URL (showkase.io/username). You may not use a username
            that impersonates another person, brand, or public figure, or that contains offensive or misleading terms.
            We reserve the right to reclaim inactive or violating usernames.
          </p>

          <h2>4. Content You Upload</h2>
          <ul>
            <li>You retain full ownership of all content you upload to Showkase.</li>
            <li>By uploading content, you grant Showkase a non-exclusive, royalty-free license to display and serve it on the platform.</li>
            <li>You must not upload content that is illegal, defamatory, infringing, pornographic, or otherwise harmful.</li>
            <li>You are solely responsible for the content you publish on your portfolio.</li>
          </ul>

          <h2>5. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for spam, phishing, or fraudulent activities</li>
            <li>Scrape, crawl, or data-mine the platform without permission</li>
            <li>Impersonate any person, brand, or entity</li>
            <li>Attempt to gain unauthorised access to other accounts or our systems</li>
            <li>Use Showkase in any way that violates applicable laws</li>
          </ul>

          <h2>6. Brand Inquiries</h2>
          <p>
            Showkase provides a contact form that allows brands to send collaboration inquiries to creators.
            Showkase is not a party to any agreements between creators and brands, and takes no responsibility
            for the outcome of such collaborations.
          </p>

          <h2>7. Platform Availability</h2>
          <p>
            We aim to keep Showkase available at all times but cannot guarantee uninterrupted access.
            We may perform maintenance, updates, or modifications at any time. We are not liable for any
            downtime or data loss.
          </p>

          <h2>8. Termination</h2>
          <p>
            We reserve the right to suspend or permanently terminate any account that violates these Terms,
            without prior notice. You may delete your account at any time from Settings.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            Showkase is provided "as is" without warranties of any kind, express or implied. We do not
            guarantee that the platform will be error-free, secure, or fit for any particular purpose.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Showkase and its team shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the platform.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. We will notify you of significant changes via email or
            an in-platform notice. Continued use after changes constitutes acceptance of the updated Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction
            of the courts of Mumbai, India.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@showkase.io">legal@showkase.io</a> or via our{' '}
            <Link to="/contact">Contact page</Link>.
          </p>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link to="/privacy" className="text-brand-600 hover:text-brand-700 font-medium">Privacy Policy →</Link>
          <Link to="/cookies" className="text-brand-600 hover:text-brand-700 font-medium">Cookies Policy →</Link>
        </div>
      </div>
    </>
  )
}
