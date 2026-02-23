import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi'
import { sendContractEmail, logContractToCRM } from '../utils/emailService'

const CONTRACT_SECTIONS = [
  {
    title: 'The Session',
    body: `This agreement is between Cameron Currence (Shot by Seven) and you, the client. The session details — date, time, location, duration, and session type — are whatever we confirmed over email or through the booking form. If anything has changed since you submitted, reach out before we shoot.`,
  },
  {
    title: 'Deposit & Payment',
    body: `A $100 non-refundable deposit is required to lock in your date. Nothing is confirmed until the deposit is paid. The remaining balance is due in full on the day of the shoot — cash, Venmo, or Zelle. If the deposit isn't received within 48 hours of booking confirmation, I reserve the right to release your date.`,
  },
  {
    title: 'Cancellations & Rescheduling',
    body: `Life happens. You can reschedule with at least 48 hours notice — no questions, no extra charge. Cancel within 24 hours of the shoot and the deposit is forfeited. If I have to cancel due to a real emergency, I'll either reschedule or refund you completely. Weather calls are made together — we can push to studio or find a new date.`,
  },
  {
    title: 'Your Photos',
    body: `You'll get a sneak peek of 5–10 edited photos within 48–72 hours. Your full gallery drops via PicTime within 7 business days. From there you can download, share, favorite, and order prints directly. Rush delivery is available — just ask upfront. The gallery stays up for 90 days; download what you want before then.`,
  },
  {
    title: 'Copyright & Usage',
    body: `I own the copyright to every photo I take — that's standard in photography. What you get is a personal use license: post them, print them, use them however you want for non-commercial purposes. I may use select images for my portfolio, website, and social media. If you'd prefer I don't use a specific photo publicly, just let me know before or right after the session and I'll respect that.`,
  },
  {
    title: 'Model Release',
    body: `By signing this agreement, you're giving me permission to feature your photos in my portfolio and promotional materials (Instagram, website, etc.). This helps me grow the business and show future clients what a real session looks like. If you want to opt out entirely, write it in the notes when booking or email me before the shoot.`,
  },
  {
    title: 'Stuff Outside My Control',
    body: `I show up ready every time. But I'm not liable for equipment failure mid-shoot, venues that don't cooperate, weather that turns, or anything else genuinely out of my hands. If I genuinely cannot deliver (illness, real emergency), you'll get a full reschedule or refund — no runaround. I'm not that photographer.`,
  },
  {
    title: 'Respect on Set',
    body: `I keep things professional and expect the same. If a session becomes unsafe, aggressive, or just stops feeling right, I reserve the right to end it early. That's rare — I've never had to — but it's in here so we're both clear. Otherwise: let's have fun and make something great.`,
  },
  {
    title: 'Governing Law',
    body: `This agreement is governed by the laws of North Carolina. Any disputes would be handled in Mecklenburg County. Hopefully we never need this section.`,
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
              I've read everything above and I agree. I understand the deposit policy, cancellation terms, and that Cam may use my photos for his portfolio unless I tell him otherwise.
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
