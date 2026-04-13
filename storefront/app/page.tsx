'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Zap,
  Star,
  BookOpen,
  Code2,
  Palette,
  FileText,
  Music,
  Video,
  Package,
  CheckCircle2,
  Users,
  TrendingUp,
} from 'lucide-react'
import CollectionSection from '@/components/marketing/collection-section'
import { useCollections } from '@/hooks/use-collections'

const productCategories = [
  { icon: BookOpen, label: 'E-Books', color: 'from-violet-500 to-purple-600', href: '/products' },
  { icon: Code2, label: 'Templates', color: 'from-blue-500 to-indigo-600', href: '/products' },
  { icon: Palette, label: 'Design Assets', color: 'from-pink-500 to-rose-600', href: '/products' },
  { icon: FileText, label: 'Courses', color: 'from-amber-500 to-orange-600', href: '/products' },
  { icon: Music, label: 'Audio', color: 'from-emerald-500 to-teal-600', href: '/products' },
  { icon: Video, label: 'Video', color: 'from-sky-500 to-cyan-600', href: '/products' },
]

const features = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Download your files immediately after purchase — no waiting, no shipping.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Licensed',
    description: 'All products come with a personal or commercial licence. Use with confidence.',
  },
  {
    icon: Download,
    title: 'Lifetime Access',
    description: 'Re-download anytime from your account. Files are yours forever.',
  },
  {
    icon: Package,
    title: 'Premium Quality',
    description: 'Every product is hand-picked and reviewed for quality before listing.',
  },
]

const stats = [
  { value: '10,000+', label: 'Happy Customers', icon: Users },
  { value: '500+', label: 'Digital Products', icon: Package },
  { value: '4.9★', label: 'Average Rating', icon: Star },
  { value: '99%', label: 'Satisfaction Rate', icon: TrendingUp },
]

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Freelance Designer',
    body: 'The design asset bundles saved me hours of work. Incredible quality and the instant download is seamless.',
    rating: 5,
  },
  {
    name: 'James T.',
    role: 'Indie Developer',
    body: 'I purchased the Next.js starter template and had my project running in under 10 minutes. Fantastic!',
    rating: 5,
  },
  {
    name: 'Priya M.',
    role: 'Content Creator',
    body: 'The e-book collection is gold. Practical, well-structured, and worth every penny.',
    rating: 5,
  },
]

export default function HomePage() {
  const { data: collections, isLoading } = useCollections()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setSubscribed(true)
    setNewsletterEmail('')
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden hero-gradient">
        {/* Background decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />

        <div className="container-custom relative py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-sm font-medium">
              <Zap className="h-3.5 w-3.5" />
              Instant Digital Downloads
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold leading-[1.08] tracking-tight text-balance">
              The best{' '}
              <span className="gradient-text">digital products</span>{' '}
              for creators
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Templates, e-books, courses, design assets and more. Download instantly and start creating today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-95 transition-all"
                prefetch={true}
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted transition-colors"
                prefetch={true}
              >
                Learn More
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No subscription
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Instant download
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Lifetime access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y bg-muted/30">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <Icon className="h-5 w-5 text-violet-500 mb-1" strokeWidth={1.75} />
                <p className="text-2xl font-heading font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Categories ── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 font-medium mb-3">
              What we offer
            </p>
            <h2 className="text-h2 font-heading font-bold">Browse by category</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              From design packs to developer tools — find exactly what you need to supercharge your workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {productCategories.map(({ icon: Icon, label, color, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-background hover:border-violet-200 dark:hover:border-violet-800 card-hover text-center"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collections (dynamic) ── */}
      {isLoading ? (
        <section className="py-section">
          <div className="container-custom">
            <div className="animate-pulse space-y-4 text-center">
              <div className="h-3 w-20 bg-muted rounded mx-auto" />
              <div className="h-8 w-64 bg-muted rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      ) : collections && collections.length > 0 ? (
        <>
          {collections.map((collection: { id: string; handle: string; title: string; metadata?: Record<string, unknown> }, index: number) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              alternate={index % 2 === 1}
            />
          ))}
        </>
      ) : null}

      {/* ── Features / Why Us ── */}
      <section className="py-section bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 font-medium mb-3">
              Why DigitalDen
            </p>
            <h2 className="text-h2 font-heading font-bold">Everything you need</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              We make buying digital products simple, safe, and instant.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-background border border-border hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/40">
                  <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 font-medium mb-3">
              Customer love
            </p>
            <h2 className="text-h2 font-heading font-bold">What creators say</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, body, rating }) => (
              <div
                key={name}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{body}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 text-center text-white">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative space-y-6">
              <p className="text-sm uppercase tracking-[0.2em] text-violet-200 font-medium">
                Ready to create?
              </p>
              <h2 className="text-h2 font-heading font-bold text-balance">
                Start downloading today
              </h2>
              <p className="text-violet-100 max-w-md mx-auto leading-relaxed">
                Join thousands of creators who use DigitalDen products to build, design, and grow faster.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-violet-700 font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all"
                prefetch={true}
              >
                Shop All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-section border-t">
        <div className="container-custom max-w-xl text-center">
          <h2 className="text-h2 font-heading font-bold">Stay in the loop</h2>
          <p className="mt-3 text-muted-foreground">
            Get notified about new digital products, exclusive deals, and creator tips.
          </p>
          {subscribed ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              You&apos;re subscribed! Welcome aboard.
            </div>
          ) : (
            <form className="mt-8 flex gap-2" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
