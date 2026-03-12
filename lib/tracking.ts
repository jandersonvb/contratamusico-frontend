type TrackingValue = string | number | boolean | null | undefined;

export type TrackingPayload = Record<string, TrackingValue>;

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const EVENT_SANITIZER_REGEX = /[^a-z0-9_]/g;

const normalizeEventName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(EVENT_SANITIZER_REGEX, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const isClient = () => typeof window !== "undefined";

const normalizePayload = (payload: TrackingPayload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

export const trackClarityEvent = (eventName: string) => {
  if (!isClient() || typeof window.clarity !== "function") {
    return;
  }

  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName) {
    return;
  }

  window.clarity("event", normalizedName);
};

export const setClarityTag = (key: string, value: TrackingValue) => {
  if (!isClient() || typeof window.clarity !== "function") {
    return;
  }

  if (value === undefined || value === null) {
    return;
  }

  const normalizedKey = normalizeEventName(key);
  if (!normalizedKey) {
    return;
  }

  window.clarity("set", normalizedKey, String(value));
};

export const pushDataLayerEvent = (
  eventName: string,
  payload: TrackingPayload = {}
) => {
  if (!isClient() || !Array.isArray(window.dataLayer)) {
    return;
  }

  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName) {
    return;
  }

  window.dataLayer.push({
    event: normalizedName,
    ...normalizePayload(payload),
  });
};

export const trackFunnelEvent = (
  eventName: string,
  payload: TrackingPayload = {}
) => {
  trackClarityEvent(eventName);
  pushDataLayerEvent(eventName, payload);
};
