export type SubscriptionBillingInterval = 'monthly' | 'yearly';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const YEARLY_THRESHOLD_DAYS = 330;

function toTimestamp(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function detectBillingInterval(
  currentPeriodStart: string | Date | null | undefined,
  currentPeriodEnd: string | Date | null | undefined,
): SubscriptionBillingInterval {
  const start = toTimestamp(currentPeriodStart);
  const end = toTimestamp(currentPeriodEnd);

  if (start === null || end === null || end <= start) {
    return 'monthly';
  }

  const diffDays = (end - start) / MS_PER_DAY;
  return diffDays >= YEARLY_THRESHOLD_DAYS ? 'yearly' : 'monthly';
}

export function getSubscriptionPlanPrice(
  plan: { monthlyPrice: number; yearlyPrice: number },
  interval: SubscriptionBillingInterval,
): number {
  return interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

export function formatCentsToBrl(valueInCents: number): string {
  return (valueInCents / 100).toFixed(2).replace('.', ',');
}
