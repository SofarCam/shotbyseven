// Cookie/tracking consent state — shared by the CookieConsent banner and
// useAnalytics. "necessary" storage (sessionStorage for the password gate,
// intro-seen flag, etc.) always runs; GA4 and the Facebook Pixel are
// non-essential and must not load until the visitor opts in here.

const CONSENT_KEY = 'sbs_cookie_consent'
export const CONSENT_CHANGED_EVENT = 'sbs-consent-changed'

// { analytics: boolean, marketing: boolean, timestamp: string } | null
export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasResponded() {
  return getConsent() !== null
}

export function setConsent({ analytics, marketing }) {
  const value = { analytics: !!analytics, marketing: !!marketing, timestamp: new Date().toISOString() }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value))
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }))
  return value
}

export function acceptAll() {
  return setConsent({ analytics: true, marketing: true })
}

export function rejectAll() {
  return setConsent({ analytics: false, marketing: false })
}
