'use client'

import { useEffect } from 'react'

export default function AnalyticsEnvCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return

    if (!process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID) {
      console.warn('NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID não configurado. GTM ficará desativado.')
    }

    if (!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
      console.warn('NEXT_PUBLIC_CLARITY_PROJECT_ID não configurado. Microsoft Clarity ficará desativado.')
    }
  }, [])

  return null
}
