export interface PlanFeature {
  /** Description of the feature */
  text: string;
  /** Whether the feature is available in this plan */
  available: boolean;
  /** Optional flag to emphasize the feature (e.g. star icon) */
  highlight?: boolean;
}

export interface Plan {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  title: string;
  /** Monthly price in Brazilian Real. Use 0 for free plans. */
  monthly: number;
  /** Discounted yearly price in Brazilian Real. */
  yearly: number;
  /** Short marketing description */
  description: string;
  /** Collection of features for the plan */
  features: PlanFeature[];
  /** Label for the primary call‑to‑action button */
  cta: string;
  /** Optional badge to highlight popular or recommended plans */
  badge?: string;
}

/**
 * Pricing plans for musicians. Mirror the structure of the original
 * planos.html page. Each plan includes monthly and yearly pricing
 * along with a list of supported features. The `featured` plan is
 * indicated with a `badge` property.
 */
export const musicianPlans: Plan[] = [
  {
    id: "free",
    title: "Gratuito",
    monthly: 0,
    yearly: 0,
    description: "Ideal para começar e testar a plataforma",
    features: [
      { text: "Perfil básico", available: true },
      { text: "Até 3 fotos no portfólio", available: true },
      { text: "Receber até 5 contatos/mês", available: true },
      { text: "Suporte por email", available: true },
      { text: "Áudios e vídeos", available: false },
      { text: "Destaque nos resultados", available: false },
    ],
    cta: "Começar Grátis",
  },
  {
    id: "pro",
    title: "Profissional",
    monthly: 29,
    yearly: 23,
    description: "Para músicos que querem se destacar",
    features: [
      { text: "Perfil completo personalizado", available: true },
      { text: "Portfólio ilimitado", available: true },
      { text: "Áudios e vídeos", available: true },
      { text: "Contatos ilimitados", available: true },
      { text: "Destaque nos resultados", available: true },
      { text: "Estatísticas detalhadas", available: true },
      { text: "Suporte prioritário", available: true },
    ],
    cta: "Escolher Plano",
    badge: "Mais Popular",
  },
  {
    id: "premium",
    title: "Premium",
    monthly: 59,
    yearly: 47,
    description: "Para músicos profissionais e bandas",
    features: [
      { text: "Tudo do plano Profissional", available: true },
      { text: "Múltiplos perfis (banda)", available: true },
      { text: "Calendário de disponibilidade", available: true },
      { text: "Sistema de contratos", available: true },
      { text: "Máxima prioridade nos resultados", available: true },
      { text: "Relatórios avançados", available: true },
      { text: "Suporte 24/7", available: true },
    ],
    cta: "Escolher Plano",
  },
];

/**
 * Pricing plans for clients. These plans cater to people hiring
 * musicians. They mirror the structure of the original HTML and
 * provide different levels of search and contact capabilities.
 */
export const clientPlans: Plan[] = [
  {
    id: "basic",
    title: "Básico",
    monthly: 0,
    yearly: 0,
    description: "Para contratações esporádicas",
    features: [
      { text: "Busca básica de músicos", available: true },
      { text: "Até 3 contatos/mês", available: true },
      { text: "Visualizar perfis públicos", available: true },
      { text: "Suporte por email", available: true },
      { text: "Filtros avançados", available: false },
      { text: "Histórico de contratações", available: false },
    ],
    cta: "Começar Grátis",
  },
  {
    id: "plus",
    title: "Plus",
    monthly: 19,
    yearly: 15,
    description: "Para quem contrata regularmente",
    features: [
      { text: "Busca avançada com filtros", available: true },
      { text: "Contatos ilimitados", available: true },
      { text: "Histórico de contratações", available: true },
      { text: "Sistema de favoritos", available: true },
      { text: "Notificações personalizadas", available: true },
      { text: "Suporte prioritário", available: true },
    ],
    cta: "Escolher Plano",
    badge: "Recomendado",
  },
  {
    id: "business",
    title: "Empresarial",
    monthly: 99,
    yearly: 79,
    description: "Para empresas e produtoras",
    features: [
      { text: "Tudo do plano Plus", available: true },
      { text: "Múltiplos usuários", available: true },
      { text: "Gerenciamento de eventos", available: true },
      { text: "Relatórios detalhados", available: true },
      { text: "API de integração", available: true },
      { text: "Gerente de conta dedicado", available: true },
      { text: "Suporte 24/7", available: true },
    ],
    cta: "Falar com Vendas",
  },
];

/**
 * Frequently asked questions for the pricing page. Each entry
 * contains a question and a corresponding answer. These will
 * populate an accordion component on the plans page.
 */
export const planFaq = [
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer:
      "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor é ajustado proporcionalmente.",
  },
  {
    question: "Existe período de teste gratuito?",
    answer:
      "Oferecemos 14 dias de teste gratuito para todos os planos pagos. Você pode cancelar a qualquer momento durante o período de teste sem cobrança.",
  },
  {
    question: "Como funciona o pagamento anual?",
    answer:
      "No plano anual, você paga 12 meses antecipadamente e recebe um desconto. O valor é cobrado uma vez por ano na data de renovação.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento. Seu plano permanecerá ativo até o final do período pago e depois será convertido para o plano gratuito.",
  },
  {
    question: "Há taxa de comissão sobre contratações?",
    answer:
      "Não cobramos comissão sobre suas contratações. Você paga apenas a mensalidade do plano escolhido e fica com 100% do valor dos seus trabalhos.",
  },
  {
    question: "Que formas de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX e boleto bancário. Para planos anuais, também oferecemos desconto adicional no PIX.",
  },
];