import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HiArrowRight, HiDownload } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'
import Navbar from './Navbar'
import Footer from './Footer'
import FilmGrain from './FilmGrain'
import { trackEvent } from '../utils/analytics'

// Stripe Payment Links redirect here after checkout with ?session_id=cs_...
// api/download.js confirms the purchase with Stripe, then serves the file.
export default function ShopThanks() {
  useSEO({
    title: 'Thank You | Shot by Seven Shop',
    description: 'Download your guide.',
    path: '/shop/thanks',
    noindex: true,
  })

  const [params] = useSearchParams()
  const sessionId = params.get('session_id') || ''
  const [state, setState] = useState(sessionId ? 'checking' : 'missing')
  const [product, setProduct] = useState(null)

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    fetch(`/api/download?session_id=${encodeURIComponent(sessionId)}&check=1`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.ok) {
          setProduct(data.product)
          setState('ready')
          trackEvent('shop_purchase', { product: data.product.slug })
        } else {
          setState('error')
        }
      })
      .catch(() => !cancelled && setState('error'))
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const downloadUrl = `/api/download?session_id=${encodeURIComponent(sessionId)}`

  return (
    <>
      <FilmGrain />
      <Navbar />
      <main className="bg-ink min-h-screen text-cream">
        <section className="pt-40 pb-24 px-6 lg:px-12 max-w-3xl mx-auto">
          <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-5">The Shop</p>

          {state === 'checking' && (
            <>
              <h1 className="font-display text-5xl font-bold text-cream mb-6">Getting your guide ready…</h1>
              <p className="text-cream/50 font-body">One second while we confirm your order.</p>
            </>
          )}

          {state === 'ready' && (
            <>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-cream leading-[1.05] mb-6">
                Thank you. <span className="italic text-gold">It&apos;s yours.</span>
              </h1>
              <p className="text-cream/55 font-body leading-relaxed mb-8">
                {product.name} is ready to download. Bookmark this page: the download button keeps working, so you can grab it again on any device.
              </p>
              <a
                href={downloadUrl}
                onClick={() => trackEvent('shop_download', { product: product.slug })}
                className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
              >
                Download {product.name} <HiDownload />
              </a>
            </>
          )}

          {(state === 'error' || state === 'missing') && (
            <>
              <h1 className="font-display text-5xl font-bold text-cream mb-6">Thank you for your order.</h1>
              <p className="text-cream/55 font-body leading-relaxed mb-4">
                We couldn&apos;t load your download automatically. Don&apos;t worry: if you paid, Stripe emailed you a receipt.
              </p>
              <p className="text-cream/55 font-body leading-relaxed">
                Forward that receipt to{' '}
                <a href="mailto:shotbyseven777@gmail.com" className="text-gold hover:text-gold/80">shotbyseven777@gmail.com</a>{' '}
                and you&apos;ll get your guide within 24 hours.
              </p>
            </>
          )}

          <div className="border-t border-cream/10 mt-16 pt-10">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Next Step</p>
            <h2 className="font-display text-3xl font-bold text-cream mb-4">Put the poses to work</h2>
            <p className="text-cream/50 font-body mb-8">
              Practice a flow in the mirror, then let me direct you through it on set.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/creators"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors"
              >
                Book a Creator Mini · $149 <HiArrowRight />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-8 py-4 border border-cream/20 text-cream/70 font-heading text-xs tracking-[0.25em] uppercase hover:border-gold/50 hover:text-cream transition-all"
              >
                Join the Model Community
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
