import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight, HiPlay } from 'react-icons/hi'
import { GemMarker } from './HiddenGems'

const videoTestimonials = [
  {
    url: '',
    thumbnail: '',
    name: 'Coming Soon',
    session: 'Portrait',
    quote: 'Video testimonial slot 1 — add YouTube URL',
  },
  {
    url: '',
    thumbnail: '',
    name: 'Coming Soon',
    session: 'Couples',
    quote: 'Video testimonial slot 2 — add YouTube URL',
  },
  {
    url: '',
    thumbnail: '',
    name: 'Coming Soon',
    session: 'Event',
    quote: 'Video testimonial slot 3 — add YouTube URL',
  },
]

function VideoCard({ video, index }) {
  const [playing, setPlaying] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const getEmbedUrl = (url) => {
    if (!url) return ''
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    return url
  }

  if (!video.url) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="border border-cream/10 overflow-hidden group"
    >
      <div className="relative aspect-video bg-warm-black">
        {playing ? (
          <iframe
            src={getEmbedUrl(video.url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer relative"
            onClick={() => setPlaying(true)}
          >
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="w-full h-full bg-cream/5 absolute inset-0" />
            )}
            <div className="relative z-10 w-14 h-14 rounded-full bg-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HiPlay className="w-6 h-6 text-ink ml-1" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-warm-black">
        <p className="text-cream/60 text-sm font-body italic leading-relaxed mb-3">&ldquo;{video.quote}&rdquo;</p>
        <p className="font-display text-cream text-sm font-bold">{video.name}</p>
        <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-cream/30 mt-0.5">{video.session}</p>
      </div>
    </motion.div>
  )
}


const testimonials = [
  {
    text: "Seven captured my graduation better than I ever dreamed. He already had a whole vision before we even started — the cap and gown shots were clean but the creative ones are what I keep coming back to. My whole family wants prints.",
    name: 'Destiny R.',
    role: 'Graduation Session — Charlotte, NC',
  },
  {
    text: "I was so nervous for my maternity shoot. Seven made me feel like myself the entire time — no awkward poses, just natural and beautiful. When I got the gallery back I literally broke down crying. These photos are everything.",
    name: 'Jasmine T.',
    role: 'Maternity Session — NoDa Art House',
  },
  {
    text: "I hired Seven for a brand shoot and I swear he understood my vision better than I did. The images were cinematic, on brand, and delivered fast. We went from 0 to a whole aesthetic in one session.",
    name: 'Marcus L.',
    role: 'Brand Content — Monthly Package',
  },
  {
    text: "Seven shot my proposal at the dome and I'm still speechless. He was invisible the whole time — I didn't even know where he was — but somehow caught every single reaction perfectly. She said yes and we have it all on camera.",
    name: 'DeShawn & Kayla',
    role: 'Proposal Photography — Charlotte',
  },
  {
    text: "Booked Seven for a studio concept shoot and showed up with just a mood board. He ran with it completely. The final images looked like an editorial spread. People thought I hired a whole production team.",
    name: 'Imani W.',
    role: 'Studio Concept Session — NoDa Art House',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  const hasVideos = videoTestimonials.some(v => v.url)

  return (
    <section className="py-32 bg-warm-black">
      <div ref={ref} className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block"
        >
          Kind Words
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-display text-5xl md:text-6xl font-bold text-cream mb-16"
        >
          Client <span className="italic text-gold">Stories</span> <GemMarker gemIndex={3} className="inline-block relative -top-3" />
        </motion.h2>

        <div className="relative">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-display text-5xl text-gold/20 mb-6">&ldquo;</div>
            <p className="font-body text-xl md:text-2xl leading-relaxed text-cream/60 mb-8 max-w-3xl mx-auto">
              {testimonials[current].text}
            </p>
            <p className="font-display text-lg font-bold text-cream">{testimonials[current].name}</p>
            <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">
              {testimonials[current].role}
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={prev}
              className="w-12 h-12 border border-cream/10 flex items-center justify-center hover:border-gold/30 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-[2px] rounded-full transition-all duration-300 ${
                    i === current ? 'bg-gold w-8' : 'bg-cream/10 w-2'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 border border-cream/10 flex items-center justify-center hover:border-gold/30 text-cream/30 hover:text-gold transition-colors"
            >
              <HiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Video Stories — only renders when at least one URL is set */}
        {hasVideos && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24"
          >
            <span className="font-heading text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Video Stories</span>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-cream mb-12">
              Hear It From <span className="italic text-gold">Them</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {videoTestimonials.map((video, i) => (
                <VideoCard key={i} video={video} index={i} />
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}
