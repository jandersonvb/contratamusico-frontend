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
    category: "Planos",
    question: "Quem precisa assinar um plano?",
    answer:
      "Os planos pagos são para músicos. Contratantes podem usar a plataforma para buscar perfis e falar com músicos sem precisar de assinatura.",
  },
  {
    category: "Recursos",
    question: "O que cada plano libera no meu perfil?",
    answer:
      "Isso depende do plano ativo. Entre os recursos liberados estão mais espaço para fotos e vídeos no portfólio, exibição pública de contatos, estatísticas, selo de verificação e destaque do perfil nos resultados.",
  },
  {
    category: "Pagamento",
    question: "Posso pagar por mês ou por ano?",
    answer:
      "Sim. Quando essa opção estiver disponível no checkout, você pode escolher cobrança mensal ou anual. No plano anual, a renovação acontece uma vez por ano.",
  },
  {
    category: "Assinatura",
    question: "Como cancelar minha assinatura?",
    answer:
      "Você pode cancelar sua assinatura para que ela termine no fim do período já pago. Até essa data, seu plano continua ativo normalmente.",
  },
  {
    category: "Assinatura",
    question: "Posso reativar depois de cancelar?",
    answer:
      "Sim. Se a assinatura ainda estiver dentro do período ativo, você pode reativá-la antes da data final.",
  },
  {
    category: "Pagamento",
    question: "Como atualizo meu cartão?",
    answer:
      "Você pode atualizar seu cartão e cuidar das cobranças pelo portal da sua assinatura.",
  },
  {
    category: "Pagamento",
    question: "O que acontece se o pagamento não for aprovado?",
    answer:
      "Se uma cobrança falhar, sua assinatura pode ficar pendente até a regularização. Quando isso acontece, a plataforma pode avisar você por email.",
  },
  {
    category: "Contratações",
    question: "A plataforma cobra comissão sobre os eventos?",
    answer:
      "Não. A cobrança da plataforma é pela assinatura do músico, e não por comissão em cada contratação.",
  },
  {
    category: "Recursos",
    question: "O que muda no meu perfil com os planos Profissional e Premium?",
    answer:
      "Os planos pagos liberam mais recursos no perfil e ajudam você a ganhar visibilidade. Dependendo do plano, seu perfil pode ter mais destaque, selo de verificação e mais sinais de confiança para quem está contratando.",
  },
  {
    category: "Assinatura",
    question: "Posso mudar de plano depois?",
    answer:
      "Sim, a assinatura pode ser gerenciada pela área de cobrança. As opções de troca dependem do que estiver disponível nesse fluxo no momento da alteração.",
  },
];
