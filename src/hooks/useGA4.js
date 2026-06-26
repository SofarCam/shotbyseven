import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_ID = import.meta.env.VITE_GA4_ID

let initialized = false

function loadGtag() {
  if (initialized || !GA_ID) return
  initialized = true

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

export default function useGA4() {
  const location = useLocation()

  useEffect(() => { loadGtag() }, [])

  useEffect(() => {
    if (!window.gtag) return
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    })
  }, [location])
}

export function trackEvent(action, params = {}) {
  if (window.gtag) window.gtag('event', action, params)
}
