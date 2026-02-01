// Declaração de tipos para o gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

/**
 * Rastreia visualizações de página
 * @param url - URL da página visualizada
 */
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

/**
 * Rastreia eventos personalizados
 * @param action - Ação do evento (ex: 'click', 'submit')
 * @param category - Categoria do evento (ex: 'engagement', 'form')
 * @param label - Label opcional do evento
 * @param value - Valor opcional do evento
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
