import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi'

// ============================================
// SEVEN BOT — Site Guide & Booking Assistant
// ============================================
// Smart keyword + intent matching — no API cost.
// Update INFO object below with real details.
// ============================================

const INFO = {
  name: 'Seven',
  studio: 'NoDa Art House',
  studioAddress: '3109 Cullman Ave, Charlotte, NC 28206',
  studioUrl: 'https://nodaarthouse.org',
  email: 'shotbyseven777@gmail.com',
  instagram: '@shotbyseven777',
  instagramUrl: 'https://instagram.com/shotbyseven777',
  portalUrl: '/portal',
  stripeUrl: 'https://buy.stripe.com/00w00ja802Rl5g74ar8og00',
  services: {
    portrait:   { name: 'Portrait / Headshots',   basePrice: 150, extraPerHr: 75, minHrs: 1,   description: 'Headshots, personal branding, couples, family, lifestyle' },
    couples:    { name: 'Couples / Engagement',    basePrice: 200, extraPerHr: 75, minHrs: 1.5, description: 'Romantic couples sessions and engagement shoots' },
    graduation: { name: 'Graduation',              basePrice: 250, extraPerHr: 75, minHrs: 2,   description: 'Cap & gown portraits and creative graduation shoots' },
    maternity:  { name: 'Maternity / Family',      basePrice: 300, extraPerHr: 75, minHrs: 2,   description: 'Maternity and family sessions — timeless, emotional, beautiful' },
    events:     { name: 'Event Coverage',          basePrice: 250, extraPerHr: 75, minHrs: 3,   description: 'Weddings, proposals, birthdays, corporate events, parties' },
    fashion:    { name: 'Fashion / Editorial',     basePrice: 350, extraPerHr: 75, minHrs: 2,   description: 'Editorial, fashion, artistic concepts at NoDa Art House' },
    sports:     { name: 'Sports / Action',         basePrice: 200, extraPerHr: 75, minHrs: 1.5, description: 'Sports, action, fitness, and lifestyle shoots' },
  },
  studioFee: 60, // per hour extra for Studio A
  depositPct: 0.25, // 25% deposit
  depositMin: 50,
  turnaround: '7 business days',
  loyalty: '3+ sessions = 50% off your next booking',
}

const QUICK_REPLIES = [
  { label: 'View Services', value: 'services' },
  { label: 'Book a Session', value: 'scroll-smart-booking' },
  { label: 'See My Work', value: 'scroll-gallery' },
  { label: 'Contact Info', value: 'contact' },
]

const BOOKING_REPLIES = [
  { label: 'Book Now', value: 'scroll-smart-booking' },
  { label: 'Pricing Info', value: 'services' },
]

// Smarter intent detection
function detectIntent(msg) {
  if (msg.match(/^(hi|hey|hello|yo|sup|what'?s up|hola|howdy)/)) return 'greeting'
  if (msg.match(/deposit|down payment|hold.*date|secure.*date|how much.*put down/)) return 'deposit'
  if (msg.match(/portal|my booking|booking status|check.*booking|track.*session|where.*my|login|log in/)) return 'portal'
  if (msg.match(/turnaround|how long|when.*photos|when.*gallery|deliver|get.*photos back/)) return 'turnaround'
  if (msg.match(/loyalty|discount|returning|repeat|come back|previous|been before/)) return 'loyalty'
  if (msg.match(/cancel|refund|reschedule|policy|policies/)) return 'policy'
  if (msg.match(/wedding|bride|groom|ceremony|reception|marry/)) return 'wedding'
  if (msg.match(/proposal|propose|engaged|engagement ring/)) return 'proposal'
  if (msg.match(/portrait|headshot|branding|linkedin|professional photo/)) return 'portrait'
  if (msg.match(/couple|partner|boyfriend|girlfriend|anniversary/)) return 'couples'
  if (msg.match(/grad|graduation|cap and gown|cap & gown|senior year|senior photo/)) return 'graduation'
  if (msg.match(/matern|pregnan|baby|bump|family|kids|children/)) return 'maternity'
  if (msg.match(/fashion|editorial|lookbook|creative|concept|model/)) return 'fashion'
  if (msg.match(/sport|action|fitness|athlete|gym|workout/)) return 'sports'
  if (msg.match(/studio|noda|art house|indoor/)) return 'studio'
  if (msg.match(/event|party|birthday|corporate|occasion/)) return 'events'
  if (msg.match(/travel|destination|out of town|fly|trip|location/)) return 'travel'
  if (msg.match(/service|package|offer|price|pricing|rate|cost|how much|what.*charge|affordable/)) return 'services'
  if (msg.match(/book|schedule|appointment|session|available|availability|slot/)) return 'booking'
  if (msg.match(/gallery|portfolio|work|photo|picture|image|see.*work|past work/)) return 'gallery'
  if (msg.match(/contact|email|phone|call|reach|talk|message|dm|text/)) return 'contact'
  if (msg.match(/location|where|address|find you|charlotte/)) return 'location'
  if (msg.match(/about|who are you|who is seven|story|experience|background|years/)) return 'about'
  if (msg.match(/instagram|ig|insta|social|follow/)) return 'instagram'
  if (msg.match(/thank|thanks|thx|appreciate|great|awesome|perfect|love it/)) return 'thanks'
  if (msg.match(/aerial|drone/)) return 'aerial'
  if (msg.match(/print|canvas|wall art|album|product/)) return 'prints'
  return 'fallback'
}

function getServiceSummary() {
  return Object.values(INFO.services)
    .map(s => `• **${s.name}** — from $${s.basePrice}`)
    .join('\n')
}

function getDepositExample() {
  const ex = INFO.services.portrait
  const total = ex.basePrice
  const dep = Math.max(INFO.depositMin, Math.round(total * INFO.depositPct))
  return { total, dep }
}

function getBotResponse(input) {
  const msg = input.toLowerCase().trim()
  const intent = detectIntent(msg)

  switch (intent) {

    case 'greeting':
      return {
        text: `Hey! Welcome to Shot by Seven. 📸\n\nI'm here to help you explore services, check pricing, or get you booked. What are you looking for?`,
        quickReplies: QUICK_REPLIES,
      }

    case 'services': {
      const list = getServiceSummary()
      return {
        text: `Here's what I offer:\n\n${list}\n\nAll base prices are for the minimum session duration. Add studio time at NoDa Art House for +$${INFO.studioFee}/hr. Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'deposit': {
      const { total, dep } = getDepositExample()
      return {
        text: `**Deposits are 25% of your session total** (minimum $${INFO.depositMin}).\n\nExample: A $${total} portrait session = **$${dep} deposit** to lock in your date.\n\nThe remaining balance is due on shoot day. Deposits are non-refundable.\n\nYou can pay your deposit here:`,
        quickReplies: [
          { label: 'Pay Deposit →', value: 'open-stripe' },
          { label: 'Book First', value: 'scroll-smart-booking' },
        ],
      }
    }

    case 'portal':
      return {
        text: `**Check your booking status anytime** at the Client Portal!\n\nYou can view:\n• Contract status\n• Deposit payment status\n• Session confirmation\n• Gallery link (when ready)\n\nJust login with your email + booking ID from your confirmation email.`,
        quickReplies: [
          { label: 'Go to Portal', value: 'open-portal' },
          { label: 'Book a Session', value: 'scroll-smart-booking' },
        ],
      }

    case 'turnaround':
      return {
        text: `**Gallery delivery: ${INFO.turnaround}** from your shoot date.\n\nYou'll get a link via email to your private online gallery through PicTime — download, share, and order prints all in one place.`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'loyalty':
      return {
        text: `**Loyalty Reward:** ${INFO.loyalty} 🎁\n\nIt's automatic — when you book, your email is checked against the system. If you've had 3+ sessions, your 50% discount is applied on the spot. No codes needed.`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'policy':
      return {
        text: `**Policies:**\n\n• Deposits are non-refundable\n• Reschedules accepted with 48+ hours notice\n• Cancellations within 24 hours forfeit the deposit\n• Weather delays are rescheduled at no charge\n\nQuestions? Reach out directly at ${INFO.email}`,
        quickReplies: [
          { label: 'Contact Cam', value: 'scroll-contact' },
          { label: 'Book a Session', value: 'scroll-smart-booking' },
        ],
      }

    case 'wedding':
      return {
        text: `**Wedding Photography** 💒\n\nI'd love to capture your day. Wedding coverage is custom-priced based on hours, location, and deliverables.\n\nHead to the booking form, select **Event Coverage**, and share your date, venue, and vision — I'll respond within 24 hours!`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'proposal':
      return {
        text: `**Proposal Photography** 💍\n\nDiscreet, seamless, and unforgettable. I'll be invisible until the moment matters.\n\nSelect **Event Coverage** in the booking form and share your plan, location, and date. Custom pricing based on your setup.`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'portrait': {
      const s = INFO.services.portrait
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hr · +$${s.extraPerHr}/hr after\n\nPerfect for headshots, LinkedIn, branding, or a personal shoot. Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'couples': {
      const s = INFO.services.couples
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n\nLet's capture your story. Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'graduation': {
      const s = INFO.services.graduation
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n\nLet's celebrate your achievement! Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'maternity': {
      const s = INFO.services.maternity
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n\nBeautiful, emotional, timeless. Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'fashion': {
      const s = INFO.services.fashion
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n🏠 Studio at NoDa Art House (+$${INFO.studioFee}/hr)\n\nBring your mood board — let's create something cinematic.`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'sports': {
      const s = INFO.services.sports
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n\nFreezing motion, capturing intensity. Ready to book?`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'studio':
      return {
        text: `**Studio A — NoDa Art House** 🎨\n\n📍 ${INFO.studioAddress}\n🌐 ${INFO.studioUrl}\n\nA stunning creative space for editorial, fashion, and concept shoots. Add studio time for +$${INFO.studioFee}/hr when booking.\n\nWant to book a studio session?`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'events': {
      const s = INFO.services.events
      return {
        text: `**${s.name}** — from $${s.basePrice}\n📋 ${s.description}\n⏱ Min ${s.minHrs}hrs · +$${s.extraPerHr}/hr after\n\nWeddings, proposals, birthdays, corporate — I've got you. Share your event details in the booking form!`,
        quickReplies: BOOKING_REPLIES,
      }
    }

    case 'travel':
      return {
        text: `**Destination / Travel Shoots** ✈️\n\nI travel for shoots — custom pricing based on location, duration, and logistics.\n\nHead to the booking form and share your location and vision. I'll reach out with a quote!`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'booking':
      return {
        text: `Let's get you booked! 📅\n\nUse the Smart Booking form on this page — pick your session type, duration, location, and availability. I'll respond within 24 hours to confirm.\n\nAll sessions require a **25% deposit** to lock in your date.`,
        quickReplies: [
          { label: 'Go to Booking', value: 'scroll-smart-booking' },
          { label: 'Deposit Info', value: 'deposit' },
        ],
      }

    case 'gallery':
      return {
        text: `Check out my work! 📸\n\nBrowse portraits, fashion, commercial, and aerial — all shot right here in Charlotte and beyond.`,
        quickReplies: [{ label: 'Go to Gallery', value: 'scroll-gallery' }],
        action: 'scroll-gallery',
      }

    case 'contact':
      return {
        text: `Here's how to reach me:\n\n📧 ${INFO.email}\n📸 Instagram: ${INFO.instagram}\n\nOr use the contact form at the bottom of the page!`,
        quickReplies: [
          { label: 'Go to Contact', value: 'scroll-contact' },
          { label: 'Book a Session', value: 'scroll-smart-booking' },
        ],
      }

    case 'location':
      return {
        text: `Based in **Charlotte, NC** 📍\n\nI shoot on location all over Charlotte — Uptown, NoDa, Freedom Park, and more. Studio work happens at:\n\n**${INFO.studio}**\n${INFO.studioAddress}\n\nI also travel for destination shoots!`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'about':
      return {
        text: `I'm Seven — Charlotte-based photographer with 8+ years behind the lens. 📸\n\nI specialize in portrait, fashion, commercial, and aerial photography. 200+ clients, featured across multiple platforms.\n\nEvery session is crafted with intention — I'm not just taking photos, I'm telling your story.`,
        quickReplies: [
          { label: 'See My Work', value: 'scroll-gallery' },
          { label: 'Book a Session', value: 'scroll-smart-booking' },
        ],
      }

    case 'instagram':
      return {
        text: `Follow the journey! 📸\n\n${INFO.instagram}\n${INFO.instagramUrl}\n\nBehind-the-scenes, new work, session highlights — all on IG.`,
        quickReplies: QUICK_REPLIES,
      }

    case 'aerial':
      return {
        text: `**Aerial / Drone Photography** 🚁\n\nYes — I do aerial work! Great for events, real estate, and creative concepts.\n\nReach out with your project details for custom pricing.`,
        quickReplies: [
          { label: 'Contact Cam', value: 'scroll-contact' },
          { label: 'Book a Session', value: 'scroll-smart-booking' },
        ],
      }

    case 'prints':
      return {
        text: `**Prints & Products** 🖼️\n\nAfter your gallery is delivered via PicTime, you can order professional prints, canvas wraps, and wall art directly through the gallery platform.\n\nPricing is through PicTime's print store.`,
        quickReplies: BOOKING_REPLIES,
      }

    case 'thanks':
      return {
        text: `You're welcome! Looking forward to creating something amazing with you. 🙏\n\nAnything else I can help with?`,
        quickReplies: [{ label: 'Book a Session', value: 'scroll-smart-booking' }],
      }

    default:
      return {
        text: `Hmm, I'm not sure about that one — but here's what I can help with:`,
        quickReplies: QUICK_REPLIES,
      }
  }
}

function formatText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/).map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="text-gold">{part}</strong> : part
    )
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>
  })
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-ink/80 rounded-2xl rounded-bl-sm w-fit">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 bg-cream/30 rounded-full block"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hey! I'm Seven's assistant. 📸\n\nI can help with services, pricing, deposits, booking status, or getting you scheduled. What do you need?`,
      quickReplies: QUICK_REPLIES,
    }
  ])
  const [input, setInput] = useState('')
  const [hasOpened, setHasOpened] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Auto-open once after 45 seconds if visitor hasn't opened it
  useEffect(() => {
    if (hasOpened) return
    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasOpened(true)
    }, 45000)
    return () => clearTimeout(timer)
  }, [hasOpened])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    setHasOpened(true)
  }

  const handleSend = useCallback((text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    // Handle scroll actions
    if (userMsg.startsWith('scroll-')) {
      const section = userMsg.replace('scroll-', '')
      const el = document.getElementById(section)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        setIsOpen(false)
      }
      return
    }

    // Handle portal open
    if (userMsg === 'open-portal') {
      window.open(INFO.portalUrl, '_self')
      return
    }

    // Handle stripe open
    if (userMsg === 'open-stripe') {
      window.open(INFO.stripeUrl, '_blank')
      return
    }

    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    const delay = 600 + Math.random() * 500

    setTimeout(() => {
      const response = getBotResponse(userMsg)
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'bot', ...response }])

      if (response.action) {
        setTimeout(() => {
          const section = response.action.replace('scroll-', '')
          const el = document.getElementById(section)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 500)
      }
    }, delay)
  }, [input])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gold text-ink rounded-full flex items-center justify-center shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: 'none' }}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><HiX className="w-6 h-6" /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><HiChat className="w-6 h-6" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-[90] w-[360px] max-w-[calc(100vw-48px)] h-[520px] max-h-[75vh] bg-warm-black border border-cream/10 rounded-xl shadow-2xl shadow-ink/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-cream/5 bg-ink/50 flex items-center gap-3">
              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="font-display text-sm font-bold text-gold">S</span>
              </div>
              <div>
                <p className="font-heading text-xs tracking-[0.15em] uppercase text-cream">Seven's Assistant</p>
                <p className="font-heading text-[9px] text-green-400/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online — replies instantly
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.from === 'bot'
                        ? 'bg-ink/80 text-cream/70 rounded-bl-sm mr-auto'
                        : 'bg-gold/20 text-cream rounded-br-sm ml-auto'
                    }`}
                  >
                    {formatText(msg.text)}
                  </motion.div>
                  {/* Quick Replies — only on last bot message */}
                  {msg.from === 'bot' && msg.quickReplies && i === messages.length - 1 && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="flex flex-wrap gap-2 mt-3"
                    >
                      {msg.quickReplies.map((qr, j) => (
                        <button
                          key={j}
                          onClick={() => handleSend(qr.value)}
                          className="font-heading text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-gold/30 text-gold/70 hover:bg-gold/10 hover:text-gold rounded-full transition-all duration-200"
                          style={{ cursor: 'none' }}
                        >
                          {qr.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-cream/5 bg-ink/30">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-ink/50 text-cream text-sm px-4 py-2.5 rounded-full border border-cream/10 focus:border-gold/30 focus:outline-none placeholder:text-cream/20 font-body"
                  style={{ cursor: 'none' }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-gold/20 hover:bg-gold/30 text-gold rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ cursor: 'none' }}
                >
                  <HiPaperAirplane className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
