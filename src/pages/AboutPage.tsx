import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Sparkles, Eye, Zap, Heart, Users, ArrowRight, CheckCircle, Star } from 'lucide-react'

const values = [
  { icon: Eye,   title: 'Visibility First', desc: 'Every creator deserves to be seen. We build tools that put your best work in front of the right brands.' },
  { icon: Zap,   title: 'Simple & Fast',    desc: 'Your portfolio should take minutes to build, not days. No design skills, no code, no hassle.' },
  { icon: Heart, title: 'Free Forever',     desc: 'Core features are free — always. Professional tools shouldn\'t depend on your follower count.' },
  { icon: Users, title: 'Built for Creators', desc: 'We obsess over the creator experience. Every feature is designed around how creators actually work.' },
]

const stats = [
  { value: '2,000+', label: 'Creators on Showkase' },
  { value: '500K+',  label: 'Portfolio views' },
  { value: '10+',    label: 'Niches covered' },
  { value: '100%',   label: 'Free forever' },
]

const team = [
  { initials: 'RK', name: 'Rahul Kumar',  role: 'Co-founder & CEO',     from: 'from-violet-400', to: 'to-indigo-500' },
  { initials: 'PS', name: 'Priya Singh',  role: 'Co-founder & Design',  from: 'from-pink-400',   to: 'to-rose-500'   },
  { initials: 'AM', name: 'Aryan Mehta',  role: 'Engineering',          from: 'from-orange-400', to: 'to-amber-500'  },
]

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About — Showkase</title>
        <meta name="description" content="Showkase is the professional portfolio and media kit platform for UGC creators. Your work deserves to be seen." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 py-20 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-100/60 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-100/60 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white border border-violet-100 shadow-sm flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-violet-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Your work deserves<br />
            <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
              to be seen.
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Showkase is the professional portfolio and media kit platform built for the next generation of creators.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-block bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-violet-100">
              Our story
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-5">Why we built Showkase</h2>
            <div className="space-y-4 text-slate-500 leading-relaxed">
              <p>
                Creators were sharing their work through messy link-in-bio tools, generic Google Docs,
                and scattered social profiles. Brands had no easy way to see the full picture —
                the stats, the collabs, the testimonials — all in one place.
              </p>
              <p>
                We built Showkase to fix that. One beautiful, professional page that tells your complete
                story as a creator. A portfolio that works as your media kit, your pitch deck, and your
                personal brand — all at once.
              </p>
              <p>
                No expensive subscriptions. No complex tools. Just your work, presented the way it deserves to be.
              </p>
            </div>
          </div>

          {/* Visual card */}
          <div className="bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 border border-violet-100 rounded-3xl p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-5">What we replaced</p>
            <div className="space-y-3 mb-6">
              {['Messy Google Docs media kits', 'Generic link-in-bio pages', 'Scattered DMs with stats screenshots', 'No-brand PDFs sent to brands'].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white/70 border border-slate-100 rounded-xl px-4 py-2.5">
                  <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                    <span className="text-red-400 text-xs font-bold">✕</span>
                  </div>
                  <span className="text-sm text-slate-500 line-through">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {['Professional portfolio at showkase.io/you', 'All stats, collabs & media in one link', 'Auto-generated media kit for brands', 'Free, always'].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-pink-50 text-pink-500 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-pink-100">
              What we stand for
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 mb-4">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-amber-100">
            The team
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">Built with love by TMMT</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {team.map(t => (
              <div key={t.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 w-44 text-center hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.from} ${t.to} flex items-center justify-center text-white font-bold text-lg mx-auto mb-3`}>
                  {t.initials}
                </div>
                <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION QUOTE ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <Star className="w-6 h-6 text-amber-400 mx-auto mb-4" />
          <p className="text-2xl font-extrabold text-slate-900 leading-snug mb-4">
            "Our mission is to help every creator — regardless of follower count — present their work
            professionally and build a sustainable creative career."
          </p>
          <p className="text-violet-500 font-semibold">— The Showkase Team</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50 border-t border-slate-100 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-72 h-72 bg-violet-100/50 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-pink-100/50 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Ready to get discovered?</h2>
          <p className="text-slate-500 mb-8">Build your free Showkase portfolio in minutes. No credit card needed.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-sm"
          >
            Create Your Portfolio — Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
