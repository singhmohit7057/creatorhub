import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Search, MapPin } from 'lucide-react'
import { profileService } from '@/services/profileService'
import { Input, Select } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { SkeletonCard } from '@/components/common/Skeleton'
import { CREATOR_CATEGORIES, COUNTRIES } from '@/utils/constants'

interface Creator {
  id: string
  username: string
  full_name: string
  creator_title: string | null
  bio: string | null
  avatar_url: string | null
  category: string | null
  city: string | null
  country: string | null
  is_featured: boolean
}

export function ExplorePage() {
  const [creators, setCreators]   = useState<Creator[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [category, setCategory]   = useState('')
  const [country, setCountry]     = useState('')

  const search = useCallback(async () => {
    setLoading(true)
    try {
      const data = await profileService.searchPublic(query, { category, country })
      setCreators(data as Creator[])
    } finally {
      setLoading(false)
    }
  }, [query, category, country])

  useEffect(() => {
    const timeout = setTimeout(search, 400)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <>
      <Helmet>
        <title>Explore Creators — Showkase</title>
        <meta name="description" content="Discover talented UGC creators, influencers, and content creators for your next brand campaign." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-surface-900 mb-3">
            Find Your Perfect Creator
          </h1>
          <p className="text-surface-500 text-lg max-w-2xl mx-auto">
            Browse thousands of professional UGC creators and influencers ready for brand collaborations
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search by name or username..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:w-48 shrink-0">
            <Select
              options={CREATOR_CATEGORIES.map(c => ({ value: c.value, label: `${c.emoji} ${c.label}` }))}
              placeholder="All Categories"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div className="sm:w-44 shrink-0">
            <Select
              options={COUNTRIES.map(c => ({ value: c, label: c }))}
              placeholder="All Countries"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No creators found</h3>
            <p className="text-surface-500 text-sm">Try different search terms or filters</p>
            <Button variant="secondary" size="md" className="mt-4" onClick={() => { setQuery(''); setCategory(''); setCountry('') }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-surface-500 mb-4">
              {creators.length} creator{creators.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map(creator => {
                const cat = CREATOR_CATEGORIES.find(c => c.value === creator.category)
                return (
                  <Link
                    key={creator.id}
                    to={`/${creator.username}`}
                    className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-card-hover hover:border-brand-200 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar src={creator.avatar_url} name={creator.full_name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-surface-900 truncate group-hover:text-brand-600 transition-colors">
                            {creator.full_name}
                          </p>
                          {creator.is_featured && <span className="text-yellow-500 text-xs">⭐</span>}
                        </div>
                        {creator.creator_title && (
                          <p className="text-xs text-surface-500 truncate mt-0.5">{creator.creator_title}</p>
                        )}
                        {(creator.city || creator.country) && (
                          <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {[creator.city, creator.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {creator.bio && (
                      <p className="text-sm text-surface-500 line-clamp-2 mb-3">{creator.bio}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {cat && <Badge variant="default">{cat.emoji} {cat.label}</Badge>}
                      <span className="text-xs text-brand-600 font-medium">View Portfolio →</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
