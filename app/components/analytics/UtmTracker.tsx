'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureFirstTouchUtm } from '@/lib/utm'

export function UtmTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    captureFirstTouchUtm(pathname || '/', searchParams)
  }, [pathname, searchParams])

  return null
}
