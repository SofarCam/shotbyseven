// ============================================
// SHOT BY SEVEN — IMAGE CONFIGURATION
// ============================================
// All site images are managed here.
// Photos live in /public/photos/
// WebP optimized versions in /public/photos/webp/
// Categories: Studio, Fashion, Outdoor, Swimwear, Maternity/Baby, Graduation, Sports, B&W, Proposal/Wedding
// Go to /manage in your browser to use the visual upload tool.
// ============================================

// Config version — bump this to clear stale localStorage caches
const CONFIG_VERSION = '6'

// Auto-clear old caches when version changes
try {
  if (localStorage.getItem('shotbyseven_version') !== CONFIG_VERSION) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('shotbyseven_'))
    keys.forEach(k => localStorage.removeItem(k))
    localStorage.setItem('shotbyseven_version', CONFIG_VERSION)
  }
} catch (e) { /* ignore */ }

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
export const defaultHeroImage = '/photos/webp/3.webp'

// ABOUT SECTION PHOTO
export const defaultAboutImage = '/photos/webp/IMG_8110.webp'

// GALLERY IMAGES — full portfolio showcase
export const defaultGalleryImages = [
  // Studio — Rose girl shoot
  { src: '/photos/webp/DM0A9139_websize.webp', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/West_Charlotte_Group-103_websize.webp', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/4_websize.webp', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/37_websize.webp', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/26_websize.webp', category: 'Studio', aspect: 'wide', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/28_websize.webp', category: 'Studio', aspect: 'wide', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/webp/10_websize.webp', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },

  // Studio — Yellow bg jersey girl shoot
  { src: '/photos/webp/edit_28_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_24_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_26_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_25_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_22_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_5_websize.webp', category: 'Studio', aspect: 'wide', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_20_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_14_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_11_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_23_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/edit_19_websize.webp', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/webp/DM0A5056_websize.webp', category: 'Studio', aspect: 'wide', title: 'Court Couture', shoot: 'jersey' },

  // Studio — Red velvet couch shoot
  { src: '/photos/webp/DM0A1214_websize.webp', category: 'Studio', aspect: 'tall', title: 'Velvet Lounge', shoot: 'velvet' },
  { src: '/photos/webp/DM0A1239_websize.webp', category: 'Studio', aspect: 'tall', title: 'Velvet Lounge', shoot: 'velvet' },

  // Studio — Purple bg white dress shoot
  { src: '/photos/webp/edit_4_websize.webp', category: 'Studio', aspect: 'tall', title: 'Lavender Dreams', shoot: 'purple' },
  { src: '/photos/webp/edit_8_websize.webp', category: 'Studio', aspect: 'tall', title: 'Lavender Dreams', shoot: 'purple' },

  // Studio — Individual creative shots
  { src: '/photos/webp/edit_1_websize.webp', category: 'Studio', aspect: 'wide', title: 'Birthday Glam', shoot: 'birthday' },
  { src: '/photos/webp/edit_15_websize.webp', category: 'Studio', aspect: 'tall', title: 'Fur Season', shoot: 'furcoat' },
  { src: '/photos/webp/DM0A3878.webp', category: 'Studio', aspect: 'wide', title: 'After Hours', shoot: 'library' },
  { src: '/photos/webp/DM0A3837_websize.webp', category: 'Studio', aspect: 'tall', title: 'In Bloom', shoot: 'purpleflowers' },

  // Fashion — Mari blazer/lace shoot
  { src: '/photos/webp/edit_9_websize.webp', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/webp/edit_10_websize.webp', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/webp/edit_12_websize.webp', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/webp/edit_13_websize.webp', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/webp/edit_2_websize.webp', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },

  // Outdoor — Red hair chain link shoot
  { src: '/photos/webp/DM0A0891_websize.webp', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },
  { src: '/photos/webp/DM0A1046_websize.webp', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },
  { src: '/photos/webp/DM0A1127_websize.webp', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },

  // Outdoor — Individual shots
  { src: '/photos/webp/DM0A1267_websize.webp', category: 'Outdoor', aspect: 'tall', title: 'After Dark', shoot: 'blackdress' },
  { src: '/photos/webp/DM0A5634_websize.webp', category: 'Outdoor', aspect: 'tall', title: 'Live & Loud', shoot: 'event' },

  // Swimwear — Beach shoot
  { src: '/photos/webp/yee_websize.webp', category: 'Swimwear', aspect: 'wide', title: 'Saltwater', shoot: 'beach' },
  { src: '/photos/webp/IMG_7540_websize.webp', category: 'Swimwear', aspect: 'wide', title: 'Saltwater', shoot: 'beach' },
  { src: '/photos/webp/edit_7_websize.webp', category: 'Swimwear', aspect: 'tall', title: 'Saltwater', shoot: 'beach' },

  // Maternity/Baby
  { src: '/photos/webp/Kyasia_lighting-107_websize.webp', category: 'Maternity/Baby', aspect: 'tall', title: 'New Beginning', shoot: 'kyasia' },
  { src: '/photos/webp/IMG_8570_websize.webp', category: 'Maternity/Baby', aspect: 'tall', title: 'Pure Joy', shoot: 'baby' },
  { src: '/photos/webp/IMG_8586_websize.webp', category: 'Maternity/Baby', aspect: 'tall', title: 'Pure Joy', shoot: 'baby' },

  // Graduation
  { src: '/photos/webp/DM0A6636_websize.webp', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/webp/DM0A6672_5_websize.webp', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/webp/DM0A6731_websize.webp', category: 'Graduation', aspect: 'wide', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/webp/DM0A6753_websize.webp', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },

  // Sports — Runner shoot
  { src: '/photos/webp/DM0A6447_websize.webp', category: 'Sports', aspect: 'tall', title: 'Full Sprint', shoot: 'runner' },
  { src: '/photos/webp/DM0A6710_websize.webp', category: 'Sports', aspect: 'wide', title: 'Full Sprint', shoot: 'runner' },

  // Sports — YMCA kids flag football
  { src: '/photos/webp/IMG_5020_websize.webp', category: 'Sports', aspect: 'tall', title: 'Future Stars', shoot: 'ymca' },
  { src: '/photos/webp/IMG_4956_websize.webp', category: 'Sports', aspect: 'tall', title: 'Future Stars', shoot: 'ymca' },
  { src: '/photos/webp/IMG_4915_websize.webp', category: 'Sports', aspect: 'wide', title: 'Future Stars', shoot: 'ymca' },

  // B&W (Black & White)
  { src: '/photos/webp/DM0A1108.webp', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/webp/DM0A2960.webp', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/webp/DM0A3194.webp', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/webp/DM0A3332.webp', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/webp/DM0A3446.webp', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/webp/DM0A3526.webp', category: 'B&W', aspect: 'wide', title: 'Contrast' },
  { src: '/photos/webp/FDF17CBA-7D1A-4DA8-BC36-5B64EAA02F7B.webp', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/webp/DM0A12352_0_websize.webp', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/webp/DM0A1236-2_0_websize.webp', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/webp/DM0A6691_websize.webp', category: 'B&W', aspect: 'wide', title: 'Raw' },

  // Proposal/Wedding — Dome proposal shoot
  { src: '/photos/webp/DM0A2936.webp', category: 'Proposal/Wedding', aspect: 'tall', title: 'The Moment', shoot: 'dome' },
  { src: '/photos/webp/DM0A3082.webp', category: 'Proposal/Wedding', aspect: 'wide', title: 'The Moment', shoot: 'dome' },
  { src: '/photos/webp/DM0A3108.webp', category: 'Proposal/Wedding', aspect: 'tall', title: 'The Moment', shoot: 'dome' },

  // Proposal/Wedding — Teal dress engagement shoot
  { src: '/photos/webp/IMG_4475_websize.webp', category: 'Proposal/Wedding', aspect: 'tall', title: 'Forever Starts Here', shoot: 'teal' },
  { src: '/photos/webp/IMG_4557_websize.webp', category: 'Proposal/Wedding', aspect: 'tall', title: 'Forever Starts Here', shoot: 'teal' },

  // Proposal/Wedding — Bokeh couple
  { src: '/photos/webp/DM0A8072_websize.webp', category: 'Proposal/Wedding', aspect: 'tall', title: 'Golden Couple', shoot: 'bokeh' },
]

// HIDDEN GEMS — secret easter egg photos
export const hiddenGems = [
  { src: '/photos/webp/DM0A5935.webp', label: 'Blue Machine', hint: 'Something fast hides in the shadows...' },
  { src: '/photos/webp/DM0A6550.webp', label: 'Red Heat', hint: 'Italian curves in crimson...' },
  { src: '/photos/webp/DM0A8311.webp', label: 'Golden Hour', hint: 'Where the sky meets fire...' },
  { src: '/photos/webp/DM0A8339.webp', label: 'Shoreline', hint: 'Salt air and sunset glow...' },
  { src: '/photos/webp/IMG_6773.webp', label: 'The Observer', hint: 'Not every subject has two legs...' },
  { src: '/photos/webp/19_websize.webp', label: 'Rose Floor', hint: 'Beauty laid bare among petals...' },
  { src: '/photos/webp/IMG_3449.webp', label: 'Eight Ball', hint: 'Corner pocket vibes...' },
]

// FEATURED STRIP IMAGES — slideshow showcase
export const defaultFeaturedImages = [
  { src: '/photos/webp/DM0A9139_websize.webp', label: 'Studio' },
  { src: '/photos/webp/edit_9_websize.webp', label: 'Fashion' },
  { src: '/photos/webp/DM0A0891_websize.webp', label: 'Outdoor' },
  { src: '/photos/webp/yee_websize.webp', label: 'Swimwear' },
  { src: '/photos/webp/Kyasia_lighting-107_websize.webp', label: 'Maternity' },
  { src: '/photos/webp/DM0A6636_websize.webp', label: 'Graduation' },
  { src: '/photos/webp/DM0A6447_websize.webp', label: 'Sports' },
  { src: '/photos/webp/DM0A1108.webp', label: 'Black & White' },
  { src: '/photos/webp/DM0A2936.webp', label: 'Proposal' },
  { src: '/photos/webp/3.webp', label: 'Editorial' },
  { src: '/photos/webp/edit_20_websize.webp', label: 'Concepts' },
  { src: '/photos/webp/edit_5_websize.webp', label: 'Color' },
]

// INSTAGRAM FEED IMAGES — square-friendly picks
export const defaultInstagramImages = [
  '/photos/webp/edit_24_websize.webp',
  '/photos/webp/edit_5_websize.webp',
  '/photos/webp/edit_11_websize.webp',
  '/photos/webp/edit_28_websize.webp',
  '/photos/webp/edit_9_websize.webp',
  '/photos/webp/edit_14_websize.webp',
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

export function getHiddenGems() {
  return hiddenGems
}
