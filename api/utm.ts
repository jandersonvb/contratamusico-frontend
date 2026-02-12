import type { StoredUtm } from '@/lib/utm'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

function getCandidateEndpoints(): string[] {
  const configured = process.env.NEXT_PUBLIC_UTM_API_PATH

  if (configured && configured.trim().length > 0) {
    return [configured.trim()]
  }

  return []
}

function normalizeEndpoint(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }

  if (endpoint.startsWith('/')) {
    return `${API_URL}${endpoint}`
  }

  return `${API_URL}/${endpoint}`
}

export async function sendUtmAttribution(utm: StoredUtm, accessToken: string): Promise<boolean> {
  const endpoints = getCandidateEndpoints()
  if (endpoints.length === 0) {
    return false
  }

  let lastError: Error | null = null

  for (const endpoint of endpoints) {
    const url = normalizeEndpoint(endpoint)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(utm),
      })

      if (response.ok) {
        return true
      }

      if (response.status === 404) {
        continue
      }

      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Erro ao enviar UTM (${response.status})`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido ao enviar UTM')
    }
  }

  if (lastError) {
    throw lastError
  }

  return false
}
