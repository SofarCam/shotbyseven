export default function Footer() {
  return (
    <footer className="border-t border-cream/5 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <a href="#" className="font-display text-xl font-bold tracking-tight text-cream">
          SEVEN<span className="text-gold">.</span>
        </a>

        <div className="flex items-center gap-8">
          <a
            href="https://instagram.com/shotbyseven777"
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
          >
            Instagram
          </a>
          <a
            href="https://shotbyseven777.pic-time.com/client"
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/20 hover:text-gold transition-colors duration-300"
          >
            Client Gallery
          </a>
        </div>

        <p className="text-cream/20 text-xs">
          &copy; {new Date().getFullYear()} Shot by Seven
        </p>
      </div>
    </footer>
  )
}
