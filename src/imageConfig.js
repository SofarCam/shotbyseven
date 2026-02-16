// ============================================
// SHOT BY SEVEN — IMAGE CONFIGURATION
// ============================================
// All site images are managed here.
// Photos live in /public/photos/
// Categories: Portrait, Fashion, Studio, Graduation, Sports
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
export const defaultHeroImage = '/photos/3.jpg'

// ABOUT SECTION PHOTO
export const defaultAboutImage = '/photos/DM0A1127_websize.JPG'

// GALLERY IMAGES — full portfolio showcase
export const defaultGalleryImages = [
  // Portrait
  { src: '/photos/DM0A9139_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_28_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_24_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_26_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_25_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/edit_22_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1267_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/DM0A12352_0_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1236-2_0_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/19_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/4_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/IMG_8570_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },
  { src: '/photos/IMG_8586_websize.JPG', category: 'Portrait', aspect: 'tall', title: '' },

  // Fashion
  { src: '/photos/DM0A0891_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1046_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/DM0A1127_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/edit_15_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/yee_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  { src: '/photos/IMG_7540_websize.JPG', category: 'Fashion', aspect: 'wide', title: '' },
  { src: '/photos/edit_7_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/37_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },
  { src: '/photos/IMG_5020_websize.JPG', category: 'Fashion', aspect: 'tall', title: '' },

  // Studio (creative concepts, birthday, maternity, editorial)
  { src: '/photos/edit_1_websize.JPG', category: 'Studio', aspect: 'wide', title: '' },
  { src: '/photos/edit_5_websize.JPG', category: 'Studio', aspect: 'wide', title: '' },
  { src: '/photos/edit_20_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_14_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_11_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_23_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/DM0A5056_websize.JPG', category: 'Studio', aspect: 'wide', title: '' },
  { src: '/photos/Kyasia_lighting-107_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/West_Charlotte_Group-103_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_9_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_10_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_12_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_13_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_19_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_2_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_4_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },
  { src: '/photos/edit_8_websize.JPG', category: 'Studio', aspect: 'tall', title: '' },

  // Graduation
  { src: '/photos/DM0A6636_websize.JPG', category: 'Graduation', aspect: 'tall', title: '' },
  { src: '/photos/26_websize.JPG', category: 'Graduation', aspect: 'tall', title: '' },
  { src: '/photos/28_websize.JPG', category: 'Graduation', aspect: 'tall', title: '' },
  { src: '/photos/10_websize.JPG', category: 'Graduation', aspect: 'tall', title: '' },
  { src: '/photos/DM0A3837_websize.JPG', category: 'Graduation', aspect: 'tall', title: '' },

  // Sports
  { src: '/photos/DM0A6447_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
  { src: '/photos/DM0A6691_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/DM0A6710_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/DM0A6672_5_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/DM0A6731_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/DM0A6753_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/DM0A8072_websize.JPG', category: 'Sports', aspect: 'wide', title: '' },
  { src: '/photos/IMG_4956_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
  { src: '/photos/IMG_4915_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
  { src: '/photos/IMG_4475_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
  { src: '/photos/IMG_4557_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
  { src: '/photos/DM0A5634_websize.JPG', category: 'Sports', aspect: 'tall', title: '' },
]

// FEATURED STRIP IMAGES — slideshow showcase
export const defaultFeaturedImages = [
  { src: '/photos/DM0A9139_websize.JPG', label: 'Portrait' },
  { src: '/photos/DM0A0891_websize.JPG', label: 'Fashion' },
  { src: '/photos/edit_1_websize.JPG', label: 'Studio' },
  { src: '/photos/DM0A6636_websize.JPG', label: 'Graduation' },
  { src: '/photos/DM0A6691_websize.JPG', label: 'Sports' },
  { src: '/photos/3.jpg', label: 'Editorial' },
  { src: '/photos/Kyasia_lighting-107_websize.JPG', label: 'Creative' },
  { src: '/photos/edit_20_websize.JPG', label: 'Concepts' },
  { src: '/photos/DM0A1046_websize.JPG', label: 'Mood' },
  { src: '/photos/edit_5_websize.JPG', label: 'Color' },
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
