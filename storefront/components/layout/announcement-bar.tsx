'use client'

import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import Link from 'next/link'

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
      <div className="container-custom flex items-center justify-center py-2.5 text-sm tracking-wide gap-2">
        <Zap className="h-3.5 w-3.5 flex-shrink-0" />
        <p>
          Instant download after purchase &mdash;{' '}
          <Link href="/products" className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">
            Browse all digital products
          </Link>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
