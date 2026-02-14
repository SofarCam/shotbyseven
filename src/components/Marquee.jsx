export default function Marquee() {
  const items = [
    'Portrait', 'Fashion', 'Editorial', 'Commercial', 'Aerial',
    'Lifestyle', 'Branding', 'Events', 'Studio', 'Outdoor',
    'Portrait', 'Fashion', 'Editorial', 'Commercial', 'Aerial',
    'Lifestyle', 'Branding', 'Events', 'Studio', 'Outdoor',
  ]

  return (
    <div className="py-8 border-y border-cream/5 overflow-hidden">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-8 px-4">
            <span className="font-display text-3xl md:text-4xl font-bold text-cream/[0.03] whitespace-nowrap hover:text-gold/20 transition-colors duration-500">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold/20 flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}
