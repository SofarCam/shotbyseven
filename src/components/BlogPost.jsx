import { motion } from 'framer-motion'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getPostBySlug } from '../blogConfig'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import ScrollProgress from './ScrollProgress'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function BodyBlock({ block }) {
  if (block.type === 'p') {
    return (
      <p className="text-cream/60 text-base leading-relaxed font-body mb-6">
        {block.content}
      </p>
    )
  }
  if (block.type === 'tip') {
    return (
      <div className="border-l-2 border-gold/40 pl-6 py-1 my-8 bg-gold/[0.03]">
        <p className="font-heading text-[9px] tracking-[0.25em] uppercase text-gold/60 mb-2">
          {block.label}
        </p>
        <p className="text-cream/50 text-sm font-body leading-relaxed italic">
          {block.content}
        </p>
      </div>
    )
  }
  return null
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) return <Navigate to="/blog" replace />

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-ink pt-24 pb-32">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[55vh] overflow-hidden mb-16"
        >
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'saturate(0.8) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

          {/* Breadcrumb + meta */}
          <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-10 max-w-3xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Link
                to="/blog"
                className="font-heading text-[9px] tracking-[0.25em] uppercase text-cream/30 hover:text-gold transition-colors duration-200 mb-4 block"
              >
                ← Studio Journal
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold/70">
                  {post.category}
                </span>
                <span className="text-cream/20">·</span>
                <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-cream/30">
                  {post.readTime}
                </span>
                <span className="text-cream/20">·</span>
                <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-cream/30">
                  {formatDate(post.date)}
                </span>
              </div>
              <h1 className="font-display text-3xl lg:text-5xl font-bold text-cream leading-tight">
                {post.title}
              </h1>
            </motion.div>
          </div>
        </motion.div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 lg:px-12"
        >
          {/* Excerpt / lead */}
          <p className="text-cream/50 text-lg leading-relaxed font-body mb-10 border-b border-cream/10 pb-10 italic">
            {post.excerpt}
          </p>

          {/* Body blocks */}
          <div className="mb-12">
            {post.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-16">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="font-heading text-[9px] tracking-[0.2em] uppercase border border-cream/10 text-cream/30 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Gallery */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="mb-16">
              <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-cream/20 mb-6">
                From This Shoot
              </p>
              <div className="grid grid-cols-2 gap-3">
                {post.gallery.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="overflow-hidden aspect-[3/4]"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      style={{ filter: 'saturate(0.85) contrast(1.05)' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="border border-cream/10 p-8 text-center">
            <p className="font-heading text-[10px] tracking-[0.3em] uppercase text-gold/50 mb-3">
              Ready to Create?
            </p>
            <h3 className="font-display text-2xl font-bold text-cream mb-4">
              Let&apos;s build something together.
            </h3>
            <p className="text-cream/30 text-sm font-body mb-6 max-w-sm mx-auto">
              Charlotte-based sessions available now. Studios, outdoor, events — let&apos;s talk.
            </p>
            <Link
              to="/#smart-booking"
              onClick={() => {
                setTimeout(() => {
                  const el = document.getElementById('smart-booking')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="inline-block px-8 py-3 bg-gold text-ink font-heading text-xs tracking-[0.25em] uppercase hover:bg-gold/90 transition-colors duration-200"
            >
              Book a Session →
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-cream/10">
            <Link
              to="/blog"
              className="font-heading text-[10px] tracking-[0.25em] uppercase text-cream/25 hover:text-gold transition-colors duration-200"
            >
              ← All Posts
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  )
}
