import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiMail, HiLocationMarker } from 'react-icons/hi'
import { FaInstagram } from 'react-icons/fa'
import { sendContactEmail } from '../utils/emailService'

const contactMethods = ['Email', 'Call', 'Text', 'Instagram DM']

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', preferredContact: 'Email', instagramHandle: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendError('')

    try {
      await sendContactEmail(formData)
      setSubmitted(true)
    } catch (err) {
      setSendError('Failed to send. Please email shotbyseven777@gmail.com directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
      <div ref={ref} className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">
            Get in Touch
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-cream mb-8">
            Let&apos;s <span className="italic text-gold">create</span>
            <br />something together
          </h2>
          <p className="text-cream/30 text-base leading-relaxed mb-12">
            Have a project in mind? I&apos;d love to hear about it. Reach out and let&apos;s
            start a conversation about bringing your vision to life.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-cream/10 flex items-center justify-center">
                <HiMail className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Email</p>
                <p className="text-cream font-medium">shotbyseven777@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-cream/10 flex items-center justify-center">
                <HiLocationMarker className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Studio Location</p>
                <p className="text-cream font-medium">NoDa Art House — Charlotte, NC</p>
                <p className="text-cream/20 text-xs">Studio rental $60/hr · Not included in session pricing</p>
              </div>
            </div>
            <a href="https://instagram.com/shotbyseven777" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
              <div className="w-12 h-12 border border-cream/10 group-hover:border-gold/30 flex items-center justify-center transition-colors">
                <FaInstagram className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Instagram</p>
                <p className="text-cream font-medium group-hover:text-gold transition-colors">@shotbyseven777</p>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="font-display text-6xl text-gold mb-6">&#10003;</div>
              <h3 className="font-display text-2xl font-bold text-cream mb-3">Message Sent</h3>
              <p className="text-cream/40 text-sm mb-8">
                I&apos;ll get back to you soon. Thanks for reaching out!
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', preferredContact: 'Email', instagramHandle: '', message: '' }) }}
                className="font-heading text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Phone Number</label>
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
                  How would you like to be reached?
                </label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {contactMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredContact: method }))}
                      className={`font-heading text-[10px] tracking-[0.1em] uppercase px-4 py-2 border transition-all duration-200 ${
                        formData.preferredContact === method
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-cream/10 text-cream/30 hover:border-gold/30 hover:text-cream/50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              {formData.preferredContact === 'Instagram DM' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Instagram Handle</label>
                  <div className="flex items-center">
                    <span className="text-cream/30 mr-2">@</span>
                    <input
                      type="text"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      required={formData.preferredContact === 'Instagram DM'}
                      className="flex-1 bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
                      placeholder="yourhandle"
                    />
                  </div>
                </motion.div>
              )}
              <div>
                <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">Message</label>
                <textarea
                  name="message" value={formData.message} onChange={handleChange} rows={5} required
                  className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 resize-none placeholder-cream/15"
                  placeholder="Tell me about your project..."
                />
              </div>

              {sendError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400/80 text-xs font-heading tracking-wider"
                >
                  {sendError}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 mt-4 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
