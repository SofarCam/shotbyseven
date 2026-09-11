import { useEffect } from 'react'

const SITE = 'https://shotbyseven.com'
const DEFAULT_IMAGE = `${SITE}/photos/webp/DM0A9139_websize.webp`
const DEFAULT_TITLE = 'Shot by Seven | Charlotte NC Photographer'
const DEFAULT_DESCRIPTION = 'Shot by Seven — Charlotte, NC photographer specializing in portraits, fashion, studio, outdoor, maternity, graduation, and event photography. Book your session today.'

function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (data == null) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Sets per-route <title>, meta description, canonical, Open Graph / Twitter
 * tags, and (optionally) a JSON-LD block for this SPA's client-side routes.
 * Resets to the site default on unmount so navigating away doesn't leave a
 * stale title/description behind.
 *
 * @param {Object} opts
 * @param {string} opts.title - Full page title (include " | Shot by Seven" if desired)
 * @param {string} opts.description
 * @param {string} opts.path - Route path starting with "/", e.g. "/studio"
 * @param {string} [opts.image] - Absolute image URL for social previews
 * @param {string} [opts.type] - Open Graph type, default "website"
 * @param {Object|null} [opts.jsonLd] - Optional JSON-LD object to inject
 * @param {Array} [opts.breadcrumbs] - Optional [{name, path}] list; when given,
 *   a BreadcrumbList schema is added alongside jsonLd
 */
export default function useSEO({ title, description, path, image, type = 'website', jsonLd = null, breadcrumbs = null }) {
  useEffect(() => {
    const url = `${SITE}${path}`
    const finalTitle = title || DEFAULT_TITLE
    const finalDesc = description || DEFAULT_DESCRIPTION
    const finalImage = image || DEFAULT_IMAGE

    document.title = finalTitle
    setMeta('description', finalDesc)
    setMeta('og:title', finalTitle, true)
    setMeta('og:description', finalDesc, true)
    setMeta('og:url', url, true)
    setMeta('og:type', type, true)
    setMeta('og:image', finalImage, true)
    setMeta('twitter:title', finalTitle, true)
    setMeta('twitter:description', finalDesc, true)
    setMeta('twitter:image', finalImage, true)
    setCanonical(url)

    if (jsonLd) setJsonLd('page-jsonld', jsonLd)

    if (breadcrumbs) {
      setJsonLd('breadcrumb-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: `${SITE}${crumb.path}`,
        })),
      })
    }

    return () => {
      document.title = DEFAULT_TITLE
      setMeta('description', DEFAULT_DESCRIPTION)
      setMeta('og:title', DEFAULT_TITLE, true)
      setMeta('og:description', DEFAULT_DESCRIPTION, true)
      setMeta('og:url', SITE, true)
      setMeta('og:type', 'website', true)
      setMeta('og:image', DEFAULT_IMAGE, true)
      setMeta('twitter:title', DEFAULT_TITLE, true)
      setMeta('twitter:description', DEFAULT_DESCRIPTION, true)
      setMeta('twitter:image', DEFAULT_IMAGE, true)
      setCanonical(SITE)
      if (jsonLd) setJsonLd('page-jsonld', null)
      if (breadcrumbs) setJsonLd('breadcrumb-jsonld', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path])
}
