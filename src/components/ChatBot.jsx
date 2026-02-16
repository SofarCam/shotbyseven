import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi'

// ============================================
// SEVEN BOT — Site Guide & Booking Assistant
// ============================================
// This bot uses keyword matching to guide visitors.
// No external API needed — fully self-contained.
// Update the INFO object below with your real details.
// ============================================

const INFO = {
  name: 'Seven',
  studio: 'NoDa Art House',
  studioAddress: '3109 Cullman Ave, Charlotte, NC 28206',
  studioUrl: 'https://nodaarthouse.org',
  email: 'shotbyseven@gmail.com',
  instagram: '@shotbyseven777',
  instagramUrl: 'https://instagram.com/shotbyseven777',
  calendlyUrl: '',
  services: {
    portrait: { name: 'Portrait Session', price: 'Starting at $150', duration: 'Hourly $50', description: 'Headshots, personal branding, couples, family, lifestyle' },
    graduation: { name: 'Graduation', price: 'Starting at $250', duration: 'Session', description: 'Cap & gown portraits, creative graduation shoots' },
    studio: { name: 'Studio Concepts', price: 'Starting at $200', duration: 'Session', description: 'Editorial, fashion, artistic concepts at NoDa Art House' },
    events: { name: 'Events', price: 'Prices vary', duration: 'Varies', description: 'Birthdays, corporate, parties, special occasions' },
    travel: { name: 'Travel Work', price: 'Custom inquiry', duration: 'Custom', description: 'Destination shoots — reach out with your location and vision' },
  },
}

const QUICK_REPLIES = [
  { label: 'View Services', value: 'services' },
  { label: 'Book a Session', value: 'booking' },
  { label: 'See My Work', value: 'gallery' },
  { label: 'Contact Info', value: 'contact' },
]

function getBotResponse(input) {
  const msg = input.toLowerCase().trim()

  // Greetings
  if (msg.match(/^(hi|hey|hello|yo|sup|what'?s up)/)) {
    return {
      text: `Hey! Welcome to Shot by Seven. 📸 I'm here to help you navigate the site, learn about services, or book a session. What can I help you with?`,
      quickReplies: QUICK_REPLIES,
    }
  }

  // Services
  if (msg.match(/service|package|offer|price|pricing|rate|cost|how much/)) {
    const services = Object.values(INFO.services)
    const list = services.map(s => `• **${s.name}** — ${s.price} (${s.duration})\n  ${s.description}`).join('\n\n')
    return {
      text: `Here's what I offer:\n\n${list}\n\nAll sessions are shot at ${INFO.studio} in Charlotte, NC. Want to book one?`,
      quickReplies: [
        { label: 'Book Now', value: 'booking' },
        { label: 'Tell Me More', value: 'about' },
      ],
    }
  }

  // Specific service queries
  if (msg.match(/portrait|headshot|family|couple|branding/)) {
    const s = INFO.services.portrait
    return {
      text: `**${s.name}** — ${s.price}\n⏱ ${s.duration}\n📋 ${s.description}\n\nShot at ${INFO.studio}. Ready to book?`,
      quickReplies: [{ label: 'Book Portrait', value: 'booking' }, { label: 'Other Services', value: 'services' }],
    }
  }
  if (msg.match(/grad|graduation|cap and gown|cap & gown/)) {
    const s = INFO.services.graduation
    return {
      text: `**${s.name}** — ${s.price}\n📋 ${s.description}\n\nLet's celebrate your achievement! Ready to book?`,
      quickReplies: [{ label: 'Book Graduation', value: 'booking' }, { label: 'Other Services', value: 'services' }],
    }
  }
  if (msg.match(/studio|concept|creative|fashion|editorial|lookbook/)) {
    const s = INFO.services.studio
    return {
      text: `**${s.name}** — ${s.price}\n📋 ${s.description}\n\nLet's create something amazing at ${INFO.studio}. Want to schedule?`,
      quickReplies: [{ label: 'Book Studio', value: 'booking' }, { label: 'Other Services', value: 'services' }],
    }
  }
  if (msg.match(/event|party|birthday|corporate|occasion/)) {
    const s = INFO.services.events
    return {
      text: `**${s.name}** — ${s.price}\n📋 ${s.description}\n\nReach out with your event details and I'll get you a quote!`,
      quickReplies: [{ label: 'Book Event', value: 'booking' }, { label: 'Other Services', value: 'services' }],
    }
  }
  if (msg.match(/travel|destination|out of town|fly|trip/)) {
    const s = INFO.services.travel
    return {
      text: `**${s.name}** — ${s.price}\n📋 ${s.description}\n\nHead to the booking section and let me know where the shoot is — I'll reach out!`,
      quickReplies: [{ label: 'Go to Booking', value: 'scroll-booking' }, { label: 'Other Services', value: 'services' }],
    }
  }

  // Booking
  if (msg.match(/book|schedule|appointment|session|available|availability|calendly/)) {
    const bookingText = INFO.calendlyUrl
      ? `You can book directly here: ${INFO.calendlyUrl}\n\nAll sessions happen at ${INFO.studio} (${INFO.studioAddress}).`
      : `I'd love to set up a session with you! Here's how:\n\n📍 **Location:** ${INFO.studio}\n${INFO.studioAddress}\n\n📧 **Email:** ${INFO.email}\n📸 **Instagram:** ${INFO.instagram}\n\nOr scroll down to the booking section on this page!`
    return {
      text: bookingText,
      quickReplies: [
        { label: 'Go to Booking', value: 'scroll-booking' },
        { label: 'View Services', value: 'services' },
      ],
      action: msg.match(/scroll/) ? 'scroll-booking' : null,
    }
  }

  // Gallery / Work
  if (msg.match(/gallery|portfolio|work|photo|picture|image|see/)) {
    return {
      text: `Check out my portfolio! You can browse by category — Portrait, Fashion, Commercial, and Aerial. Scroll down or click below.`,
      quickReplies: [{ label: 'Go to Gallery', value: 'scroll-gallery' }],
      action: 'scroll-gallery',
    }
  }

  // Contact
  if (msg.match(/contact|email|phone|call|reach|talk|message|dm/)) {
    return {
      text: `Here's how to reach me:\n\n📧 ${INFO.email}\n📸 Instagram: ${INFO.instagram}\n\nOr use the contact form at the bottom of the page!`,
      quickReplies: [
        { label: 'Go to Contact', value: 'scroll-contact' },
        { label: 'Book Instead', value: 'booking' },
      ],
    }
  }

  // Location / Studio
  if (msg.match(/location|where|studio|noda|address|charlotte/)) {
    return {
      text: `I shoot out of **${INFO.studio}** in Charlotte, NC.\n\n📍 ${INFO.studioAddress}\n🌐 ${INFO.studioUrl}\n\nIt's a beautiful creative space perfect for any type of session!`,
      quickReplies: [{ label: 'Book a Session', value: 'booking' }, { label: 'View Services', value: 'services' }],
    }
  }

  // About
  if (msg.match(/about|who|story|experience|year|background/)) {
    return {
      text: `I'm Seven — a photographer based in Charlotte, NC with 8+ years behind the lens. I specialize in portrait, fashion, commercial, and aerial photography.\n\nEvery frame is crafted with intention, warmth, and a deep connection to the moment. My work has been featured across multiple platforms and I've worked with 200+ clients.\n\nWant to see the work?`,
      quickReplies: [
        { label: 'See Gallery', value: 'gallery' },
        { label: 'Book a Session', value: 'booking' },
      ],
    }
  }

  // Instagram
  if (msg.match(/instagram|ig|insta|social/)) {
    return {
      text: `Follow the journey on Instagram!\n\n📸 ${INFO.instagram}\n${INFO.instagramUrl}\n\nI post behind-the-scenes, new work, and session highlights.`,
      quickReplies: QUICK_REPLIES,
    }
  }

  // Thank you
  if (msg.match(/thank|thanks|thx|appreciate/)) {
    return {
      text: `You're welcome! If you need anything else, I'm right here. Looking forward to creating something beautiful together. 🙏`,
      quickReplies: [{ label: 'Book a Session', value: 'booking' }],
    }
  }

  // Default / Fallback
  return {
    text: `I'd love to help! Here are some things I can assist with:`,
    quickReplies: QUICK_REPLIES,
  }
}

function formatText(text) {
  // Simple markdown-like bold
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/).map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="text-gold">{part}</strong> : part
    )
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>
  })
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hey! I'm Seven's assistant. 📸\n\nI can help you explore the site, learn about services, or book a session. What are you looking for?`,
      quickReplies: QUICK_REPLIES,
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setInput('')

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(userMsg)
      setMessages(prev => [...prev, { from: 'bot', ...response }])

      if (response.action) {
        setTimeout(() => {
          const section = response.action.replace('scroll-', '')
          const el = document.getElementById(section)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 500)
      }
    }, 400 + Math.random() * 400)
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
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gold text-ink rounded-full flex items-center justify-center shadow-lg shadow-gold/20 hover:bg-gold-light transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: 'none' }}
      >
        {isOpen ? <HiX className="w-6 h-6" /> : <HiChat className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-[90] w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] bg-warm-black border border-cream/10 rounded-xl shadow-2xl shadow-ink/50 flex flex-col overflow-hidden"
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
                  Online
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
                  {/* Quick Replies */}
                  {msg.from === 'bot' && msg.quickReplies && i === messages.length - 1 && (
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
