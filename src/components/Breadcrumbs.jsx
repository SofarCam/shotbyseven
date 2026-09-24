import { Link } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi'

/**
 * Visible breadcrumb trail. Pass the same [{name, path}] list given to
 * useSEO's `breadcrumbs` option so the visible trail matches the
 * BreadcrumbList structured data.
 */
export default function Breadcrumbs({ items, className = '' }) {
  if (!items || items.length < 2) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className={`flex flex-wrap items-center gap-2 font-heading text-[10px] tracking-[0.15em] uppercase ${className}`}>
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {isLast ? (
                <span className="text-cream/40" aria-current="page">{crumb.name}</span>
              ) : (
                <Link to={crumb.path} className="text-cream/25 hover:text-gold transition-colors">
                  {crumb.name}
                </Link>
              )}
              {!isLast && <HiChevronRight className="text-cream/15" size={10} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
