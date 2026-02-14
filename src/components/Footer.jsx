export default function Footer() {
  return (
    <footer className="border-t border-cream/5 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <a href="#" className="font-display text-xl font-bold tracking-tight text-cream">
          SEVEN<span className="text-gold">.</span>
        </a>

        <div className="flex items-center gap-8">
          {['Instagram', 'TikTok', 'Pinterest', 'LinkedIn'].map((social) => (
            <a
              key={social}
              href="#"
              className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
            >
              {social}
            </a>
          ))}
        </div>

        <p className="text-cream/20 text-xs">
          &copy; {new Date().getFullYear()} Shot by Seven
        </p>
      </div>
    </footer>
  )
}
