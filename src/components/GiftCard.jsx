import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiGift, HiArrowLeft, HiCamera } from 'react-icons/hi'
import useSEO from '../hooks/useSEO'

const GIFT_CARD_URL = import.meta.env.VITE_STRIPE_GIFT_CARD_URL

const amounts = [75, 150, 250, 350, 500]

export default function GiftCard() {
  useSEO({
    title: 'Gift Cards | Shot by Seven',
    description: 'Give the gift of a photography session with Shot by Seven. Gift cards in any amount from $75, redeemable for any session type — no expiration.',
    path: '/gift',
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Gift Cards', path: '/gift' }],
  })

  const [selected, setSelected] = useState(150)
  const [custom, setCustom] = useState('')

  const finalAmount = custom ? parseInt(custom, 10) || 0 : selected

  const handleBuy = () => {
    if (!GIFT_CARD_URL || finalAmount < 50) return
    const url = `${GIFT_CARD_URL}?prefilled_amount=${finalAmount * 100}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-warm-black text-cream px-6 py-16">
      <div className="max-w-lg mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 hover:text-gold transition-colors mb-12"
        >
          <HiArrowLeft /> Back to Site
        </Link>

        <div className="text-center mb-12">
          <HiGift className="text-gold text-4xl mx-auto mb-6" />
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            Shot by Seven
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">
            Gift a <span className="italic text-gold">Session</span>
          </h1>
          <p className="text-cream/40 leading-relaxed">
            Give someone the experience of working with Cam — redeemable for any shoot type, any time.
          </p>
        </div>

        <div className="space-y-8">
          {/* Amount picker */}
          <div>
            <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold mb-4">
              Choose an amount
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setSelected(amt); setCustom('') }}
                  className={'p-3 border text-center transition-all ' + (!custom && selected === amt ? 'border-gold bg-gold/10 text-cream' : 'border-cream/10 text-cream/50 hover:border-gold/30')}
                >
                  <span className="font-display font-bold">${amt}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cream/30 text-sm">Or enter custom:</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40">$</span>
                <input
                  type="number"
                  min={50}
                  max={2500}
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setSelected(0) }}
                  placeholder="e.g. 200"
                  className="w-full bg-transparent border border-cream/20 pl-7 pr-4 py-3 text-cream focus:border-gold outline-none"
                />
              </div>
            </div>
            {custom && parseInt(custom) < 50 && (
              <p className="text-red-400/70 text-xs mt-2">Minimum gift card amount is $50.</p>
            )}
          </div>

          {/* What's included */}
          <div className="border border-cream/5 p-6 space-y-3">
            <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold mb-4">What&apos;s Included</p>
            {[
              'Redeemable for any session type — portraits, headshots, graduation, events',
              "No expiration date — use it whenever you're ready",
              'Recipient books directly through the site',
              'Any remaining balance stays on the gift card',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <HiCamera className="text-gold text-sm flex-shrink-0 mt-0.5" />
                <p className="text-cream/50 text-sm">{item}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {GIFT_CARD_URL ? (
            <button
              onClick={handleBuy}
              disabled={finalAmount < 50}
              className="w-full font-heading text-xs tracking-[0.2em] uppercase text-ink bg-gold py-4 hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {finalAmount >= 50 ? `Purchase $${finalAmount} Gift Card →` : 'Select an Amount'}
            </button>
          ) : (
            <div className="border border-cream/10 bg-cream/5 p-5 text-center">
              <p className="text-cream/40 text-sm mb-2">Gift cards coming very soon.</p>
              <p className="text-cream/25 text-xs">
                In the meantime, email{' '}
                <a href="mailto:shotbyseven777@gmail.com" className="text-gold/70 hover:text-gold">
                  shotbyseven777@gmail.com
                </a>{' '}
                to arrange a gift session directly.
              </p>
            </div>
          )}

          <p className="text-cream/20 text-xs text-center">
            Secure checkout via Stripe · Questions? shotbyseven777@gmail.com
          </p>

          <p className="text-center text-sm">
            <Link to="/#gallery" className="text-gold/70 hover:text-gold transition-colors">
              See the portfolio
            </Link>
            <span className="text-cream/20 mx-2">·</span>
            <Link to="/#pricing-calculator" className="text-gold/70 hover:text-gold transition-colors">
              View session pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
