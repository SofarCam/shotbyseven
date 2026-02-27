import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { blogPosts } from '../blogConfig'
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

export default function Blog() {
  const sorted = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date))
  const [featured, ...rest] = sorted

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-ink pt-24 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center py-20 px-6"
        >
          <p className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-4">
            Studio Journal
          </p>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-cream mb-5">
            Behind the Lens
          </h1>
          <p className="text-cream/30 text-sm max-w-md mx-auto">
            Stories from the studio, location notes, and what actually goes into making the photos.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mb-16"
          >
            <Link to={`/blog/${featured.slug}`} className="group block">
              <div className="grid lg:grid-cols-2 gap-0 border border-cream/10 overflow-hidden hover:border-gold/30 transition-all duration-300">
                {/* Cover image */}
                <div className="relative h-72 lg:h-auto overflow-hidden">
                  <img
                    src={featured.cover}
                    alt={featured.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'saturate(0.85) contrast(1.05)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/60 lg:to-ink/80" />
                  <span className="absolute top-4 left-4 font-heading text-[9px] tracking-[0.25em] uppercase bg-gold text-ink px-3 py-1">
                    Latest
                  </span>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold/60">
                      {featured.category}
                    </span>
                    <span className="text-cream/20">·</span>
                    <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-cream/30">
                      {featured.readTime}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold text-cream mb-4 group-hover:text-gold/90 transition-colors duration-200">
                    {featured.title}
                  </h2>
                  <p className="text-cream/40 text-sm leading-relaxed mb-6 font-body">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-cream/20 text-xs font-body">{formatDate(featured.date)}</span>
                    <span className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold group-hover:tracking-[0.3em] transition-all duration-200">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Rest of posts */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block border border-cream/10 hover:border-gold/30 transition-all duration-300 overflow-hidden">
                    {/* Cover */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'saturate(0.85) contrast(1.05)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold/60">
                          {post.category}
                        </span>
                        <span className="text-cream/20">·</span>
                        <span className="font-heading text-[9px] tracking-[0.1em] uppercase text-cream/25">
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-cream mb-2 group-hover:text-gold/90 transition-colors duration-200 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-cream/35 text-sm leading-relaxed font-body line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-cream/20 text-xs font-body">{formatDate(post.date)}</span>
                        <span className="font-heading text-[9px] tracking-[0.15em] uppercase text-gold/60 group-hover:text-gold transition-colors duration-200">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
