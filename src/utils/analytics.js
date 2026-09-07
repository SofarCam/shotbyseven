// Unified analytics layer — fires events to both GA4 (gtag) and Facebook Pixel (fbq).
// Both are no-ops when their script hasn't loaded (env var unset), so calling
// trackEvent is always safe.

// Generic custom event. GA4 receives `action` + params; FB Pixel receives it as
// a trackCustom event so it shows up in the Events Manager.
export function trackEvent(action, params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', action, params)
  if (window.fbq) window.fbq('trackCustom', action, params)
}

// A lead was captured (contact form, IG handoff). Maps to FB's standard "Lead"
// event for ad optimization, plus a GA4 generate_lead event.
export function trackLead(params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', 'generate_lead', params)
  if (window.fbq) window.fbq('track', 'Lead', params)
}

// A booking was submitted. Maps to FB's standard "Schedule" event (a booked
// appointment) and a GA4 conversion event carrying value + currency.
export function trackBooking(params = {}) {
  if (typeof window === 'undefined') return
  if (window.gtag) window.gtag('event', 'booking_submitted', { currency: 'USD', ...params })
  if (window.fbq) window.fbq('track', 'Schedule', params)
}
