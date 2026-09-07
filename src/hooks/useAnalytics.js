import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_ID = import.meta.env.VITE_GA4_ID
const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID

let gaLoaded = false
let fbLoaded = false

function loadGA4() {
  if (gaLoaded || !GA_ID) return
  gaLoaded = true

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
}

function loadFbPixel() {
  if (fbLoaded || !FB_PIXEL_ID) return
  fbLoaded = true

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js')

  window.fbq('init', FB_PIXEL_ID)
}

export default function useAnalytics() {
  const location = useLocation()

  useEffect(() => {
    loadGA4()
    loadFbPixel()
  }, [])

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      })
    }
    if (window.fbq) window.fbq('track', 'PageView')
  }, [location])
}
