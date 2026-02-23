import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi'
import { sendContractEmail, logContractToCRM } from '../utils/emailService'

const CONTRACT_TEXT = `PHOTOGRAPHY SERVICES AGREEMENT

This Photography Services Agreement ("Agreement") is entered into between Cameron Currence, operating as Shot by Seven ("Photographer"), and the client identified below ("Client").

1. SERVICES
Photographer agrees to provide photography services as described in the booking request submitted by Client via shotbyseven.com. Session details (date, location, duration, session type) are as confirmed via email correspondence.

2. PAYMENT & DEPOSIT
A non-refundable deposit of $100 is required to confirm and hold the session date. The remaining balance is due on the day of the session. Failure to pay deposit within 48 hours of booking confirmation may result in forfeiture of the date.

3. CANCELLATION & RESCHEDULING
Client may reschedule with at least 48 hours notice at no additional charge. Cancellations within 24 hours of the session forfeit the deposit. Photographer reserves the right to reschedule due to weather, illness, or emergency with no penalty.

4. DELIVERY
Edited photos will be delivered via PicTime gallery within 7 business days of the session. A sneak peek of 5–10 images will be delivered within 48–72 hours. Rush delivery available for an additional fee.

5. USAGE RIGHTS
Photographer retains full copyright of all images. Client receives a personal use license for printing and sharing. Photographer may use images for portfolio, website, and social media unless Client opts out in writing before the session.

6. MODEL RELEASE
Client grants Photographer permission to use photographs for marketing, portfolio display, and promotional purposes. Client may opt out of this release by notifying Photographer in writing prior to the session.

7. LIABILITY WAIVER
Photographer is not liable for equipment failure, weather conditions, venue restrictions, or any circumstances beyond Photographer's reasonable control. In the event of Photographer inability to perform (illness, emergency), a full refund or rescheduled session will be offered.

8. CONDUCT
Both parties agree to conduct themselves professionally. Photographer reserves the right to end a session early without refund if Client behavior is unsafe, disrespectful, or violates agreed-upon session parameters.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of North Carolina.

By signing below, Client acknowledges reading, understanding, and agreeing to all terms of this Agreement.`

export default function ContractSign() {
  const { bookingId } = useParams()
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSig, setHasSig] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#f0e6c8' // cream color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDrawing(true)
    setHasSig(true)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = (e) => {
    e.preventDefault()
    setDrawing(false)
  }

  const clearSig = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSig(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasSig) { setError('Please draw your signature.'); return }
    if (!agreed) { setError('Please check the agreement box.'); return }
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }

    setSending(true)
    setError('')

    const signatureBase64 = canvasRef.current.toDataURL('image/png')

    try {
      await sendContractEmail({
        clientName: name,
        clientEmail: email,
        bookingId: bookingId || 'N/A',
        signedDate: today,
        signatureImage: signatureBase64,
      })

      logContractToCRM({
        type: 'CONTRACT',
        name,
        email,
        bookingId: bookingId || 'N/A',
        signedDate: today,
      })

      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please email shotbyseven777@gmail.com directly.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <HiCheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-cream mb-3">Contract Signed</h1>
          <p className="text-cream/50 font-body text-sm leading-relaxed mb-8">
            Your signed contract has been emailed to <span className="text-cream/70">{email}</span> and to Shot by Seven. You're all set — see you at the session!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-heading text-xs tracking-[0.2em] uppercase text-gold/70 hover:text-gold transition-colors duration-200"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Site
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 hover:text-cream/60 transition-colors duration-200 mb-8"
          >
            <HiArrowLeft className="w-3 h-3" />
            Shot by Seven
          </Link>
          <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-gold mb-3">
            Booking ID: {bookingId || 'N/A'}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-2">
            Photography Agreement
          </h1>
          <p className="text-cream/40 font-body text-sm">{today}</p>
        </motion.div>

        {/* Contract Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-cream/10 bg-cream/3 p-6 mb-8 max-h-72 overflow-y-auto"
        >
          <pre className="whitespace-pre-wrap font-body text-xs text-cream/40 leading-relaxed">
            {CONTRACT_TEXT}
          </pre>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-8"
        >
          {/* Name */}
          <div>
            <label className="block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your legal name"
              className="w-full bg-transparent border-b border-cream/20 focus:border-gold outline-none py-2 text-cream font-body text-sm placeholder:text-cream/20 transition-colors duration-200"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-heading text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Where to send your copy"
              className="w-full bg-transparent border-b border-cream/20 focus:border-gold outline-none py-2 text-cream font-body text-sm placeholder:text-cream/20 transition-colors duration-200"
              required
            />
          </div>

          {/* Signature Canvas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/50">
                Signature
              </label>
              {hasSig && (
                <button
                  type="button"
                  onClick={clearSig}
                  className="font-heading text-[10px] tracking-[0.15em] uppercase text-cream/30 hover:text-gold/60 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="border border-cream/20 bg-cream/3 relative">
              {!hasSig && (
                <p className="absolute inset-0 flex items-center justify-center text-cream/20 font-body text-sm pointer-events-none select-none">
                  Draw your signature here
                </p>
              )}
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`mt-0.5 w-4 h-4 shrink-0 border transition-colors duration-200 flex items-center justify-center ${
                agreed ? 'border-gold bg-gold/20' : 'border-cream/20 group-hover:border-cream/40'
              }`}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && <span className="text-gold text-xs">✓</span>}
            </div>
            <span className="font-body text-sm text-cream/50 leading-relaxed">
              I have read and agree to all terms of the Photography Services Agreement, including the model release, liability waiver, and payment policy.
            </span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-red-400/80 font-body text-sm">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gold/10 border border-gold/30 hover:bg-gold/20 hover:border-gold/60 text-gold font-heading text-xs tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Sign & Submit Contract'}
          </button>
        </motion.form>

      </div>
    </div>
  )
}
