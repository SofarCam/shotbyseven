import { motion } from 'framer-motion'
import useSEO from '../../hooks/useSEO'
import Navbar from '../Navbar'
import Footer from '../Footer'
import CustomCursor from '../CustomCursor'
import FilmGrain from '../FilmGrain'
import ScrollProgress from '../ScrollProgress'
import Breadcrumbs from '../Breadcrumbs'

export default function LegalLayout({ title, eyebrow, lastUpdated, path, description, children }) {
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: title, path }]

  useSEO({
    title: `${title} | Shot by Seven`,
    description,
    path,
    breadcrumbs,
  })

  return (
    <>
      <CustomCursor />
      <FilmGrain />
      <ScrollProgress />
      <Navbar />

      <main className="min-h-screen bg-ink pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 lg:px-12"
        >
          <Breadcrumbs items={breadcrumbs} />
          <p className="font-heading text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-4">{eyebrow}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-3">{title}</h1>
          {lastUpdated && (
            <p className="text-cream/25 text-xs font-body mb-14">Last updated {lastUpdated}</p>
          )}

          <div className="legal-prose space-y-10">
            {children}
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  )
}

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-cream mb-3">{heading}</h2>
      <div className="text-cream/50 text-sm font-body leading-relaxed space-y-3 [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold-light [&_strong]:text-cream/70 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
