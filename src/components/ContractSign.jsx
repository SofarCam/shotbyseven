import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi'
import { sendContractEmail, logContractToCRM } from '../utils/emailService'

const CONTRACT_SECTIONS = [
  {
    title: 'Parties & Scope of Services',
    body: `This Photography Services Agreement ("Agreement") is entered into between Cameron Currence, operating as Shot by Seven ("Photographer"), and the undersigned client ("Client"). Photographer agrees to provide professional photography services for the session confirmed via shotbyseven.com, including the date, time, location, duration, and session type as specified in the booking confirmation. Any changes to session details must be communicated and agreed upon in writing prior to the session date.`,
  },
  {
    title: 'Deposit & Payment Terms',
    body: `A non-refundable deposit (minimum $100.00 USD, exact amount confirmed at booking) is required to reserve and confirm the session date. No date is held without receipt of the deposit. The remaining session balance is due in full on or before the day of the session, payable via cash, Venmo, or Zelle. Failure to remit the deposit within 48 hours of booking confirmation may result in forfeiture of the reserved date without further notice.`,
  },
  {
    title: 'Cancellation & Rescheduling Policy',
    body: `Client may reschedule the session at no additional charge with a minimum of 48 hours advance notice. Cancellations made within 24 hours of the scheduled session will result in forfeiture of the deposit. In the event the Photographer must cancel due to illness, emergency, or circumstances beyond reasonable control, Client will be offered the choice of a full rescheduled session at no additional cost or a complete refund of all payments made. Weather-related postponements will be handled collaboratively, with options including a studio alternative or a rescheduled outdoor session.`,
  },
  {
    title: 'Image Delivery',
    body: `Client will receive a preview gallery of 5–10 professionally edited images within 48–72 hours of the session. The complete edited gallery will be delivered via PicTime within 7 business days. The online gallery will remain accessible for a period of 90 days, during which Client may download, share, favorite, and order prints. Rush delivery may be requested prior to the session and is subject to an additional fee. Photographer is not responsible for images not downloaded before gallery expiration.`,
  },
  {
    title: 'Copyright & Licensing',
    body: `Photographer retains full copyright ownership of all photographs produced under this Agreement. Client is granted a non-exclusive, non-transferable personal use license to reproduce, display, and share the delivered images for personal, non-commercial purposes. Client may not sell, license, or use images for commercial purposes without prior written consent from the Photographer. Photographer reserves the right to use any images for portfolio display, website, print publications, and social media marketing unless Client submits a written opt-out request prior to the session.`,
  },
  {
    title: 'Model & Portfolio Release',
    body: `By executing this Agreement, Client grants Photographer permission to display, publish, and distribute session photographs for professional portfolio and promotional purposes, including but not limited to: the Photographer's website, social media accounts, print marketing materials, and third-party photography publications. Client may opt out of this release in full or in part by providing written notice to the Photographer at shotbyseven777@gmail.com no later than 24 hours before the scheduled session.`,
  },
  {
    title: 'Limitation of Liability',
    body: `Photographer shall not be held liable for failure to deliver services due to circumstances beyond reasonable control, including but not limited to: equipment failure or malfunction, severe weather conditions, venue access restrictions, illness, injury, or acts of third parties. In any such event, Photographer's total liability shall be limited to a full refund of amounts paid by Client or a rescheduled session of equal value, at Photographer's discretion. Photographer is not liable for indirect, incidental, or consequential damages of any kind.`,
  },
  {
    title: 'Professional Conduct',
    body: `Both parties agree to conduct themselves in a professional, respectful, and safe manner throughout the session. Photographer reserves the right to terminate a session without refund if Client engages in behavior that is unsafe, harassing, unlawful, or otherwise incompatible with a professional working environment. This provision applies to Client and any guests or subjects present during the session.`,
  },
  {
    title: 'Entire Agreement & Governing Law',
    body: `This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior communications, representations, or understandings. This Agreement shall be governed by and construed in accordance with the laws of the State of North Carolina, without regard to conflict of law principles. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of Mecklenburg County, North Carolina.`,
  },
]

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

        {/* Contract Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 space-y-0 border border-cream/10"
        >
          {CONTRACT_SECTIONS.map((section, i) => (
            <div key={i} className="border-b border-cream/10 last:border-b-0 px-6 py-5">
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold mb-2">
                {String(i + 1).padStart(2, '0')} — {section.title}
              </p>
              <p className="font-body text-sm text-cream/50 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
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
              I have read, understood, and agree to all terms of this Photography Services Agreement, including the deposit and payment policy, cancellation terms, copyright and licensing provisions, and model release. I acknowledge that my electronic signature below constitutes a legally binding acceptance of this Agreement.
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
