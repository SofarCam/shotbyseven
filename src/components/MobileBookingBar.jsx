import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { hasResponded, CONSENT_CHANGED_EVENT } from '../utils/consent'

export default function MobileBookingBar() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [cookieBannerClear, setCookieBannerClear] = useState(hasResponded())

  useEffect(() => {
    const onChange = () => setCookieBannerClear(true)
    window.addEventListener(CONSENT_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange)
  }, [])

  // Never show on the pages this bar would point back to, or on utility/admin routes
  const hiddenOn = ['/manage', '/content', '/contract', '/portal', '/thank-you', '/links', '/shop/thanks']
  if (!cookieBannerClear || hiddenOn.some((p) => pathname.startsWith(p))) return null

  const onCreators = pathname === '/creators'
  const onCommunity = pathname === '/community'
  const onShop = pathname === '/shop'
  const label = onCreators ? 'Request Your Spot' : onCommunity ? 'Join the Community' : onShop ? 'Get the Free Guide' : 'Book a Session'
  const className = 'flex-1 text-center font-heading text-xs tracking-[0.2em] uppercase px-4 py-4 bg-gold text-ink'

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex bg-warm-black/95 backdrop-blur border-t border-gold/20">
      {onCreators || onCommunity || onShop ? (
        <a href={onCommunity ? '#join' : onShop ? '#free-guide' : '#request'} className={className}>{label}</a>
      ) : onHome ? (
        <a href="#smart-booking" className={className}>{label}</a>
      ) : (
        <Link to="/#smart-booking" className={className}>{label}</Link>
      )}
    </div>
  )
}
