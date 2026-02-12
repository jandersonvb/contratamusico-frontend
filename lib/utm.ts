import type { ReadonlyURLSearchParams } from 'next/navigation'
import { sendUtmAttribution } from '@/api/utm'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const STORAGE_KEY = 'cm:first_touch_utm'

export type UtmKey = (typeof UTM_KEYS)[number]

export type StoredUtm = Partial<Record<UtmKey, string>> & {
  landing_path: string
  captured_at: string
}

function hasUtmParams(searchParams: URLSearchParams): boolean {
  return UTM_KEYS.some((key) => {
    const value = searchParams.get(key)
    return typeof value === 'string' && value.trim().length > 0
  })
}

function buildUtmPayload(pathname: string, searchParams: URLSearchParams): StoredUtm {
  const payload: StoredUtm = {
    landing_path: pathname,
    captured_at: new Date().toISOString(),
  }

  UTM_KEYS.forEach((key) => {
    const value = searchParams.get(key)
    if (value) {
      payload[key] = value
    }
  })

  return payload
}

export function getStoredFirstTouchUtm(): StoredUtm | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as StoredUtm
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function captureFirstTouchUtm(pathname: string, searchParamsLike: URLSearchParams | ReadonlyURLSearchParams) {
  if (typeof window === 'undefined') return
  if (getStoredFirstTouchUtm()) return

  const searchParams = new URLSearchParams(searchParamsLike.toString())
  if (!hasUtmParams(searchParams)) return

  const payload = buildUtmPayload(pathname, searchParams)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearStoredFirstTouchUtm() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function clearUtmParamsFromUrl() {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  let changed = false

  UTM_KEYS.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      changed = true
    }
  })

  if (!changed) return

  const nextPath = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, document.title, nextPath)
}

export async function sendStoredUtmAfterAuth(accessToken: string): Promise<boolean> {
  const utm = getStoredFirstTouchUtm()
  if (!utm) return false

  const sent = await sendUtmAttribution(utm, accessToken)
  if (!sent) return false

  clearStoredFirstTouchUtm()
  clearUtmParamsFromUrl()
  return true
}
