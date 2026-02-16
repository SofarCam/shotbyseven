// ============================================
// SHOT BY SEVEN — IMAGE CONFIGURATION
// ============================================
// All site images are managed here.
// Photos live in /public/photos/
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

// HERO BACKGROUND — wide cinematic shot
export const defaultHeroImage = '/photos/3.jpg'

// ABOUT SECTION PHOTO — portrait of Cam or behind the scenes
export const defaultAboutImage = '/photos/DM0A1127_websize.JPG'

// GALLERY IMAGES — full portfolio showcase
export const defaultGalleryImages = [
  // Portrait
  { src: '/photos/DM0A9139_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/West_Charlotte_Group-103_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_28_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_24_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_26_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1267_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  // Fashion
  { src: '/photos/DM0A0891_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1127_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/edit_1_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  { src: '/photos/edit_7_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/IMG_7540_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  { src: '/photos/yee_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  // Commercial
  { src: '/photos/DM0A6447_websize.JPG', category: 'Commercial', aspect: 'tall', title: '' },
  { src: '/photos/DM0A6691_websize.JPG', category: 'Commercial', aspect: 'wide', title: '' },
  { src: '/photos/DM0A6710_websize.JPG', category: 'Commercial', aspect: 'wide', title: '' },
  { src: '/photos/edit_14_websize.JPG', category: 'Commercial', aspect: 'tall', title: '' },
  // Events
  { src: '/photos/DM0A5634_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/IMG_4915_websize.JPG', category: 'Portrait', aspect: 'wide', title: '' },
  { src: '/photos/Kyasia_lighting-107_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_5_websize.JPG', category: 'Portrait', aspect: 'wide', title: '' },
  { src: '/photos/edit_15_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/edit_20_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  { src: '/photos/edit_22_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_25_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
]

// FEATURED STRIP IMAGES — your 6 best shots
export const defaultFeaturedImages = [
  { src: '/photos/DM0A9139_websize.JPG', label: 'Portrait' },
  { src: '/photos/DM0A0891_websize.JPG', label: 'Fashion' },
  { src: '/photos/edit_1_websize.JPG', label: 'Creative' },
  { src: '/photos/Kyasia_lighting-107_websize.JPG', label: 'Studio' },
  { src: '/photos/DM0A6691_websize.JPG', label: 'Sports' },
  { src: '/photos/3.jpg', label: 'Editorial' },
]

// INSTAGRAM FEED IMAGES — square-friendly picks
export const defaultInstagramImages = [
  '/photos/edit_24_websize.JPG',
  '/photos/edit_5_websize.JPG',
  '/photos/edit_11_websize.JPG',
  '/photos/edit_28_websize.JPG',
  '/photos/DM0A6753_websize.JPG',
  '/photos/edit_14_websize.JPG',
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
