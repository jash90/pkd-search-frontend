// Thin, SSR-safe wrapper around the GA4 gtag.js tag loaded in index.html.
// Every browser API access is guarded — components in this app are also rendered
// in Node during the vite-react-ssg prerender, where window/document/localStorage
// do not exist.

export const GA_MEASUREMENT_ID = 'G-LDQ45ZTGFL';
export const CONSENT_KEY = 'pkd-analytics-consent'; // 'granted' | 'denied'

type ConsentValue = 'granted' | 'denied';

const isBrowser = (): boolean => typeof window !== 'undefined';

// Push through window.gtag when present, otherwise fall back to the dataLayer
// queue (same contract gtag.js uses). No-op on the server.
function pushGtag(...args: unknown[]): void {
  if (!isBrowser()) return;
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  pushGtag('event', name, params ?? {});
}

export function trackPageView(path: string, title?: string): void {
  pushGtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? (isBrowser() ? document.title : undefined),
    page_location: isBrowser() ? window.location.href : undefined,
  });
}

// Read the persisted consent choice. Call from effects only (never during render).
export function getStoredConsent(): ConsentValue | null {
  if (!isBrowser()) return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

// Update Consent Mode v2 and persist the choice.
export function applyConsent(granted: boolean): void {
  const value: ConsentValue = granted ? 'granted' : 'denied';
  pushGtag('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
}
