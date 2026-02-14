import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
                <p className="text-cream font-medium">hello@shotbyseven.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-cream/10 flex items-center justify-center">
                <HiPhone className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Phone</p>
                <p className="text-cream font-medium">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-cream/10 flex items-center justify-center">
                <HiLocationMarker className="text-gold" />
              </div>
              <div>
                <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">Location</p>
                <p className="text-cream font-medium">Available Worldwide</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div>
            <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 resize-none placeholder-cream/15"
              placeholder="Tell me about your project..."
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 mt-4"
          >
            Send Message
          </motion.button>
        </motion.form>
      </div>
    </section>
  )
}
