// ============================================
// SHOT BY SEVEN — IMAGE CONFIGURATION
// ============================================
// All site images are managed here.
// To add your own photos:
//   1. Drop your images into /public/photos/
//   2. Reference them as '/photos/your-image.jpg'
//   OR use any external URL (Unsplash, Google Drive, Pic-Time, etc.)
//
// Go to /manage in your browser to use the visual upload tool.
// ============================================

// Try to load saved images from localStorage, fall back to defaults
function loadImages(key, defaults) {
  try {
    const saved = localStorage.getItem(`shotbyseven_${key}`)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return defaults
}

export function saveImages(key, images) {
  localStorage.setItem(`shotbyseven_${key}`, JSON.stringify(images))
}

// HERO BACKGROUND
export const defaultHeroImage = 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80'

// ABOUT SECTION PHOTO
export const defaultAboutImage = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80'

// GALLERY IMAGES
export const defaultGalleryImages = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', category: 'Portrait', aspect: 'tall', title: '' },
  { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', category: 'Fashion', aspect: 'wide', title: '' },
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', category: 'Fashion', aspect: 'tall', title: '' },
  { src: 'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=800&q=80', category: 'Portrait', aspect: 'square', title: '' },
  { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', category: 'Aerial', aspect: 'wide', title: '' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', category: 'Portrait', aspect: 'tall', title: '' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80', category: 'Commercial', aspect: 'square', title: '' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', category: 'Portrait', aspect: 'tall', title: '' },
  { src: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=800&q=80', category: 'Aerial', aspect: 'wide', title: '' },
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', category: 'Fashion', aspect: 'tall', title: '' },
  { src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80', category: 'Commercial', aspect: 'wide', title: '' },
  { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', category: 'Portrait', aspect: 'square', title: '' },
]

// FEATURED STRIP IMAGES
export const defaultFeaturedImages = [
  { src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', label: 'Portrait I' },
  { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', label: 'Fashion I' },
  { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', label: 'Editorial' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80', label: 'Portrait II' },
  { src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', label: 'Fashion II' },
  { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', label: 'Aerial' },
]

// INSTAGRAM FEED IMAGES
export const defaultInstagramImages = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
]

// Getters that check localStorage first
export function getHeroImage() {
  return loadImages('hero', defaultHeroImage)
}

export function getAboutImage() {
  return loadImages('about', defaultAboutImage)
}

export function getGalleryImages() {
  return loadImages('gallery', defaultGalleryImages)
}

export function getFeaturedImages() {
  return loadImages('featured', defaultFeaturedImages)
}

export function getInstagramImages() {
  return loadImages('instagram', defaultInstagramImages)
}
