// ============================================
// SHOT BY SEVEN — IMAGE CONFIGURATION
// ============================================
// All site images are managed here.
// Photos live in /public/photos/
// Categories: Studio, Fashion, Outdoor, Swimwear, Maternity/Baby, Graduation, Sports, B&W, Proposal/Wedding
// Go to /manage in your browser to use the visual upload tool.
// ============================================

// Config version — bump this to clear stale localStorage caches
const CONFIG_VERSION = '5'

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
export const defaultHeroImage = '/photos/3.jpg'

// ABOUT SECTION PHOTO
export const defaultAboutImage = '/photos/IMG_8110.JPG'

// GALLERY IMAGES — full portfolio showcase
// Photos are grouped by shoot within each category for slideshow feature
export const defaultGalleryImages = [
  // Studio — Rose girl shoot
  { src: '/photos/DM0A9139_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/West_Charlotte_Group-103_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/4_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/37_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/26_websize.JPG', category: 'Studio', aspect: 'wide', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/28_websize.JPG', category: 'Studio', aspect: 'wide', title: 'Petal & Shadow', shoot: 'rose' },
  { src: '/photos/10_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Petal & Shadow', shoot: 'rose' },

  // Studio — Yellow bg jersey girl shoot
  { src: '/photos/edit_28_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_24_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_26_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_25_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_22_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_5_websize.JPG', category: 'Studio', aspect: 'wide', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_20_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_14_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_11_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_23_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/edit_19_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Court Couture', shoot: 'jersey' },
  { src: '/photos/DM0A5056_websize.JPG', category: 'Studio', aspect: 'wide', title: 'Court Couture', shoot: 'jersey' },

  // Studio — Red velvet couch shoot
  { src: '/photos/DM0A1214_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Velvet Lounge', shoot: 'velvet' },
  { src: '/photos/DM0A1239_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Velvet Lounge', shoot: 'velvet' },

  // Studio — Purple bg white dress shoot
  { src: '/photos/edit_4_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Lavender Dreams', shoot: 'purple' },
  { src: '/photos/edit_8_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Lavender Dreams', shoot: 'purple' },

  // Studio — Individual creative shots
  { src: '/photos/edit_1_websize.JPG', category: 'Studio', aspect: 'wide', title: 'Birthday Glam', shoot: 'birthday' },
  { src: '/photos/edit_15_websize.JPG', category: 'Studio', aspect: 'tall', title: 'Fur Season', shoot: 'furcoat' },
  { src: '/photos/DM0A3878.JPG', category: 'Studio', aspect: 'wide', title: 'After Hours', shoot: 'library' },
  { src: '/photos/DM0A3837_websize.JPG', category: 'Studio', aspect: 'tall', title: 'In Bloom', shoot: 'purpleflowers' },

  // Fashion — Mari blazer/lace shoot
  { src: '/photos/edit_9_websize.JPG', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/edit_10_websize.JPG', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/edit_12_websize.JPG', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/edit_13_websize.JPG', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },
  { src: '/photos/edit_2_websize.JPG', category: 'Fashion', aspect: 'tall', title: 'Power Moves', shoot: 'mari' },

  // Outdoor — Red hair chain link shoot
  { src: '/photos/DM0A0891_websize.JPG', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },
  { src: '/photos/DM0A1046_websize.JPG', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },
  { src: '/photos/DM0A1127_websize.JPG', category: 'Outdoor', aspect: 'tall', title: 'Chain Reaction', shoot: 'redhair' },

  // Outdoor — Individual shots
  { src: '/photos/DM0A1267_websize.JPG', category: 'Outdoor', aspect: 'tall', title: 'After Dark', shoot: 'blackdress' },
  { src: '/photos/DM0A5634_websize.JPG', category: 'Outdoor', aspect: 'tall', title: 'Live & Loud', shoot: 'event' },

  // Swimwear — Beach shoot
  { src: '/photos/yee_websize.JPG', category: 'Swimwear', aspect: 'wide', title: 'Saltwater', shoot: 'beach' },
  { src: '/photos/IMG_7540_websize.JPG', category: 'Swimwear', aspect: 'wide', title: 'Saltwater', shoot: 'beach' },
  { src: '/photos/edit_7_websize.JPG', category: 'Swimwear', aspect: 'tall', title: 'Saltwater', shoot: 'beach' },

  // Maternity/Baby
  { src: '/photos/Kyasia_lighting-107_websize.JPG', category: 'Maternity/Baby', aspect: 'tall', title: 'New Beginning', shoot: 'kyasia' },
  { src: '/photos/IMG_8570_websize.JPG', category: 'Maternity/Baby', aspect: 'tall', title: 'Pure Joy', shoot: 'baby' },
  { src: '/photos/IMG_8586_websize.JPG', category: 'Maternity/Baby', aspect: 'tall', title: 'Pure Joy', shoot: 'baby' },

  // Graduation
  { src: '/photos/DM0A6636_websize.JPG', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/DM0A6672_5_websize.JPG', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/DM0A6731_websize.JPG', category: 'Graduation', aspect: 'wide', title: 'Walk The Stage', shoot: 'grad' },
  { src: '/photos/DM0A6753_websize.JPG', category: 'Graduation', aspect: 'tall', title: 'Walk The Stage', shoot: 'grad' },

  // Sports — Runner shoot
  { src: '/photos/DM0A6447_websize.JPG', category: 'Sports', aspect: 'tall', title: 'Full Sprint', shoot: 'runner' },
  { src: '/photos/DM0A6710_websize.JPG', category: 'Sports', aspect: 'wide', title: 'Full Sprint', shoot: 'runner' },

  // Sports — YMCA kids flag football
  { src: '/photos/IMG_5020_websize.JPG', category: 'Sports', aspect: 'tall', title: 'Future Stars', shoot: 'ymca' },
  { src: '/photos/IMG_4956_websize.JPG', category: 'Sports', aspect: 'tall', title: 'Future Stars', shoot: 'ymca' },
  { src: '/photos/IMG_4915_websize.JPG', category: 'Sports', aspect: 'wide', title: 'Future Stars', shoot: 'ymca' },

  // B&W (Black & White)
  { src: '/photos/DM0A1108.JPG', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/DM0A2960.JPG', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/DM0A3194.JPG', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/DM0A3332.JPG', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/DM0A3446.JPG', category: 'B&W', aspect: 'tall', title: 'Contrast' },
  { src: '/photos/DM0A3526.JPG', category: 'B&W', aspect: 'wide', title: 'Contrast' },
  { src: '/photos/FDF17CBA-7D1A-4DA8-BC36-5B64EAA02F7B.JPG', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/DM0A12352_0_websize.JPG', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/DM0A1236-2_0_websize.JPG', category: 'B&W', aspect: 'tall', title: 'Raw' },
  { src: '/photos/DM0A6691_websize.JPG', category: 'B&W', aspect: 'wide', title: 'Raw' },

  // Proposal/Wedding — Dome proposal shoot
  { src: '/photos/DM0A2936.JPG', category: 'Proposal/Wedding', aspect: 'tall', title: 'The Moment', shoot: 'dome' },
  { src: '/photos/DM0A3082.JPG', category: 'Proposal/Wedding', aspect: 'wide', title: 'The Moment', shoot: 'dome' },
  { src: '/photos/DM0A3108.JPG', category: 'Proposal/Wedding', aspect: 'tall', title: 'The Moment', shoot: 'dome' },

  // Proposal/Wedding — Teal dress engagement shoot
  { src: '/photos/IMG_4475_websize.JPG', category: 'Proposal/Wedding', aspect: 'tall', title: 'Forever Starts Here', shoot: 'teal' },
  { src: '/photos/IMG_4557_websize.JPG', category: 'Proposal/Wedding', aspect: 'tall', title: 'Forever Starts Here', shoot: 'teal' },

  // Proposal/Wedding — Bokeh couple
  { src: '/photos/DM0A8072_websize.JPG', category: 'Proposal/Wedding', aspect: 'tall', title: 'Golden Couple', shoot: 'bokeh' },
]

// HIDDEN GEMS — secret photos scattered around the site
export const hiddenGems = [
  { src: '/photos/DM0A5935.JPG', label: 'Blue Machine', hint: 'Something fast hides in the shadows...' },
  { src: '/photos/DM0A6550.JPG', label: 'Red Heat', hint: 'Italian curves in crimson...' },
  { src: '/photos/DM0A8311.JPG', label: 'Golden Hour', hint: 'Where the sky meets fire...' },
  { src: '/photos/DM0A8339.JPG', label: 'Shoreline', hint: 'Salt air and sunset glow...' },
  { src: '/photos/IMG_6773.JPG', label: 'The Observer', hint: 'Not every subject has two legs...' },
  { src: '/photos/19_websize.JPG', label: 'Rose Floor', hint: 'Beauty laid bare among petals...' },
  { src: '/photos/IMG_3449.JPG', label: 'Eight Ball', hint: 'Corner pocket vibes...' },
]

// FEATURED STRIP IMAGES — slideshow showcase
export const defaultFeaturedImages = [
  { src: '/photos/DM0A9139_websize.JPG', label: 'Studio' },
  { src: '/photos/edit_9_websize.JPG', label: 'Fashion' },
  { src: '/photos/DM0A0891_websize.JPG', label: 'Outdoor' },
  { src: '/photos/yee_websize.JPG', label: 'Swimwear' },
  { src: '/photos/Kyasia_lighting-107_websize.JPG', label: 'Maternity' },
  { src: '/photos/DM0A6636_websize.JPG', label: 'Graduation' },
  { src: '/photos/DM0A6447_websize.JPG', label: 'Sports' },
  { src: '/photos/DM0A1108.JPG', label: 'Black & White' },
  { src: '/photos/DM0A2936.JPG', label: 'Proposal' },
  { src: '/photos/3.jpg', label: 'Editorial' },
  { src: '/photos/edit_20_websize.JPG', label: 'Concepts' },
  { src: '/photos/edit_5_websize.JPG', label: 'Color' },
]

// INSTAGRAM FEED IMAGES — square-friendly picks
export const defaultInstagramImages = [
  '/photos/edit_24_websize.JPG',
  '/photos/edit_5_websize.JPG',
  '/photos/edit_11_websize.JPG',
  '/photos/edit_28_websize.JPG',
  '/photos/edit_9_websize.JPG',
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

export function getHiddenGems() {
  return hiddenGems
}
