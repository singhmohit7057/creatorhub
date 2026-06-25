import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowRight, Sparkles, Briefcase, BarChart2, Globe,
  CheckCircle, Star, TrendingUp, Users, Eye,
  Instagram, Youtube, Zap, Shield, Heart, Camera,
} from 'lucide-react'

// ── Mock portfolio card ───────────────────────────────────────────────────────
function MockPortfolioCard() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      {/* soft shadow blob */}
      <div className="absolute -inset-4 bg-gradient-to-br from-violet-200/60 via-pink-100/40 to-amber-100/50 rounded-[2.5rem] blur-2xl" />

      <div className="relative bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        {/* top bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold">
            AS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 font-bold text-sm">Arjun Sharma</p>
            <p className="text-slate-400 text-xs">UGC Creator · Mumbai</p>
          </div>
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap">
            Open to work
          </span>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Instagram,   val: '82K',  label: 'Followers' },
            { icon: Youtube,     val: '4.2M', label: 'Views'     },
            { icon: TrendingUp,  val: '6.8%', label: 'Eng. Rate' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
              <s.icon className="w-3 h-3 text-violet-400 mx-auto mb-1" />
              <p className="text-slate-800 font-bold text-xs">{s.val}</p>
              <p className="text-slate-400 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* collab */}
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 rounded-xl p-3 mb-4">
          <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-1.5">Recent Collab</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-slate-800 text-xs font-semibold">Nykaa Beauty × Fashion Reel</p>
              <p className="text-slate-400 text-[10px]">3.2M views · ₹45,000</p>
            </div>
          </div>
        </div>

        {/* cta */}
        <button className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold py-2 rounded-xl text-sm">
          View Portfolio →
        </button>
        <p className="text-center text-slate-300 text-[10px] mt-2">showkase.io/arjunsharma</p>
      </div>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, desc, bg, iconColor,
}: {
  icon: React.ElementType; title: string; desc: string; bg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Testimonial ───────────────────────────────────────────────────────────────
function TestimonialCard({ name, niche, quote, initials, from, to }: {
  name: string; niche: string; quote: string; initials: string; from: string; to: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-4">"{quote}"</p>
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 m-0 leading-tight text-left">{name}</p>
          <p className="text-xs text-slate-400 m-0 leading-tight text-left">{niche}</p>
        </div>
      </div>
    </div>
  )
}

const categories = [
  'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 'Fitness', 'Tech', 'Gaming',
  'Education', 'Finance', 'Parenting', 'Music', 'Entertainment', 'Sports', 'Art',
  'Photography', 'Comedy', 'DIY', 'Pets', 'Health', 'Business', 'Automotive', 'Nature',
  'Motivation', 'Other',
]

const features = [
  { icon: Globe,      title: 'Your own URL',         desc: 'A beautiful portfolio at showkase.io/yourname. One link, shareable everywhere.', bg: 'bg-violet-50',  iconColor: 'text-violet-500' },
  { icon: Briefcase,  title: 'Showcase Collabs',      desc: 'Display brand campaigns with results — views, reach, and revenue proof.', bg: 'bg-pink-50',    iconColor: 'text-pink-500'   },
  { icon: BarChart2,  title: 'Analytics Dashboard',   desc: 'See who visits, where they come from, and how brands are finding you.', bg: 'bg-blue-50',    iconColor: 'text-blue-500'   },
  { icon: Camera,     title: 'Media Kit Ready',       desc: 'Auto-generated media kit from your portfolio. Send to brands in seconds.', bg: 'bg-amber-50',  iconColor: 'text-amber-500'  },
  { icon: Users,      title: 'Get Discovered',        desc: 'Appear in our Explore page — brands browse creators by niche and reach.', bg: 'bg-teal-50',   iconColor: 'text-teal-500'   },
  { icon: Shield,     title: 'Free Forever',          desc: 'No paywalls, no premium tiers. Every feature is free for every creator.', bg: 'bg-emerald-50',iconColor: 'text-emerald-500'},
]

const testimonials = [
  { name: 'Priya Nair',   niche: 'Beauty Creator · Kochi',   initials: 'PN', from: 'from-pink-400',   to: 'to-rose-500',   quote: 'I landed 3 brand deals in my first week after going live. The portfolio looks so professional — brands take you seriously.' },
  { name: 'Rohan Mehta',  niche: 'Tech Creator · Bangalore', initials: 'RM', from: 'from-violet-400', to: 'to-indigo-500', quote: 'Brands started reaching out instead of me chasing them. Having all my stats in one place makes such a huge difference.' },
  { name: 'Sneha Kapoor', niche: 'Food Creator · Delhi',     initials: 'SK', from: 'from-orange-400', to: 'to-amber-500',  quote: 'Setup took 10 minutes and the result looks like I hired a designer. Showkase is exactly what creators have been needing.' },
]

const included = [
  'Professional portfolio page', 'Custom username URL',
  'Media gallery (images + videos)', 'Brand collaborations showcase',
  'Client testimonials section', 'Social stats display',
  'Analytics dashboard', 'Contact form for brands',
  '4 portfolio templates', 'Explore page listing',
  'Auto media kit', 'Mobile optimised',
]

const steps = [
  { n: '1', title: 'Sign up free',       desc: 'Create your account with email or Google in seconds.' },
  { n: '2', title: 'Pick a template',    desc: 'Choose from 4 premium templates made for creators.' },
  { n: '3', title: 'Fill your profile',  desc: 'Add your bio, niche, social stats, and links.' },
  { n: '4', title: 'Upload your work',   desc: 'Add media, brand collabs, and testimonials.' },
  { n: '5', title: 'Share & get hired',  desc: 'Go live at showkase.io/yourname and get discovered.' },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')

  function claimUsername(e: React.FormEvent) {
    e.preventDefault()
    const slug = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (slug) navigate(`/register?username=${slug}`)
  }

  return (
    <>
      <Helmet>
        <title>Showkase — Professional Portfolio Platform for Creators</title>
        <meta name="description" content="Build your professional creator portfolio in minutes. Showcase your work, brand collaborations, and get discovered by top brands. Free forever." />
      </Helmet>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#faf9f7] min-h-[88vh] flex items-center">
        {/* Soft ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-violet-100/70 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-pink-100/70 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-50/80 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white border border-violet-100 shadow-sm rounded-full px-4 py-1.5 text-sm font-medium text-violet-600 mb-7">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Free for every creator — always
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.07] tracking-tight text-slate-900 mb-6">
                Your work<br />
                <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400 bg-clip-text text-transparent">
                  deserves to
                </span>
                <br />be seen.
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                One beautiful link for your stats, brand collabs, media, and testimonials.
                Built to get you discovered.
              </p>

              {/* Claim bar */}
              <form onSubmit={claimUsername}
                className="flex items-stretch bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden max-w-md mx-auto lg:mx-0 mb-4"
              >
                <div className="flex items-center flex-1 px-4 gap-1.5 min-w-0">
                  <span className="text-slate-300 text-sm font-medium whitespace-nowrap shrink-0">showkase.io/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="yourname"
                    className="flex-1 py-3.5 text-slate-800 placeholder:text-slate-300 outline-none bg-transparent text-sm font-medium min-w-0"
                    maxLength={30}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold px-5 py-3.5 text-sm transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  Claim yours
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-slate-400 text-xs mb-10">No credit card · No subscription · Free forever</p>

              {/* Stat pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {[
                  { icon: Users, val: '2,000+',  label: 'Active creators' },
                  { icon: Eye,   val: '500K+',   label: 'Portfolio views'  },
                  { icon: Heart, val: '98%',     label: 'Love it'         },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2">
                    <div className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                      <s.icon className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{s.val}</span>
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock card */}
            <div className="flex justify-center lg:justify-end">
              <MockPortfolioCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── NICHE STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100 py-5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/explore?category=${cat.toLowerCase()}`}
                className="px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
            Loved by creators across every niche
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-violet-100">
              Everything included
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              Built for serious creators
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Everything you need to land brand deals — in one polished, shareable link.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Steps */}
            <div>
              <span className="inline-block bg-pink-50 text-pink-500 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-pink-100">
                How it works
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-8">
                Portfolio live<br />in 5 minutes.
              </h2>
              <div className="space-y-5">
                {steps.map(s => (
                  <div key={s.n} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-pink-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {s.n}
                    </div>
                    <div className="pt-0.5">
                      <p className="font-semibold text-slate-900 text-sm">{s.title}</p>
                      <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <p className="font-bold text-slate-900 text-sm">Everything included, free</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {included.map(item => (
                  <div key={item} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-300 text-xs mt-4">No hidden fees · No premium tier · Ever</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO TEASER ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-amber-100">
            See it in action
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">
            See what brands see<br />when they find you on Showkase
          </h2>

          <div className="relative rounded-3xl aspect-video shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/sFWFp8v_cNw"
              title="Showkase Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-violet-50 via-pink-50 to-rose-50">
        {/* blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-80 h-80 bg-violet-200/40 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-pink-200/40 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-violet-100 rounded-full px-4 py-1.5 text-sm font-medium text-violet-600 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Your portfolio, your brand
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Claim your Showkase
            <span className="block bg-gradient-to-r from-violet-500 via-pink-500 to-rose-400 bg-clip-text text-transparent mt-1">
              in 60 seconds.
            </span>
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            Join thousands of creators getting discovered by brands every day.
          </p>

          <form onSubmit={claimUsername}
            className="flex items-stretch bg-white border border-slate-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden max-w-md mx-auto mb-4"
          >
            <div className="flex items-center flex-1 px-4 gap-1.5 min-w-0">
              <span className="text-slate-300 text-sm font-medium whitespace-nowrap shrink-0">showkase.io/</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="yourname"
                className="flex-1 py-3.5 text-slate-800 placeholder:text-slate-300 outline-none bg-transparent text-sm font-medium min-w-0"
                maxLength={30}
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold px-5 py-3.5 text-sm transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              Claim yours
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-slate-400 text-xs">No credit card · No subscription · Free forever</p>
        </div>
      </section>
    </>
  )
}
