import { useState, useRef, useCallback } from 'react'
import { HiPlus, HiTrash, HiArrowLeft, HiPhotograph, HiUpload, HiCheck } from 'react-icons/hi'
import {
  defaultHeroImage, defaultAboutImage, defaultGalleryImages,
  defaultFeaturedImages, defaultInstagramImages,
  getHeroImage, getAboutImage, getGalleryImages,
  getFeaturedImages, getInstagramImages, saveImages
} from '../imageConfig'

const categories = ['Portrait', 'Fashion', 'Studio', 'Graduation', 'Sports', 'B&W', 'Engagement']
const aspects = ['tall', 'wide', 'square']

function fileToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

function DropZone({ onFiles, label = 'Drop images here or click to upload', multiple = true }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setDragging(false)
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
    if (files.length) onFiles(files)
  }, [onFiles])

  const handleChange = useCallback(async (e) => {
    const files = [...e.target.files].filter(f => f.type.startsWith('image/'))
    if (files.length) onFiles(files)
    e.target.value = ''
  }, [onFiles])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
        dragging ? 'border-gold bg-gold/10' : 'border-cream/10 hover:border-gold/40'
      }`}
    >
      <HiUpload className="w-8 h-8 mx-auto mb-3 text-gold/50" />
      <p className="font-heading text-sm text-cream/50">{label}</p>
      <p className="font-heading text-[10px] text-cream/20 mt-1">JPG, PNG, WebP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

function ImageThumb({ src, onRemove, children }) {
  return (
    <div className="group relative aspect-square overflow-hidden bg-warm-black rounded">
      <img src={src} alt="" className="w-full h-full object-cover" />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-ink/80 text-cream/60 hover:text-red-400 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  )
}

export default function ImageManager({ onBack }) {
  const [heroImg, setHeroImg] = useState(getHeroImage())
  const [aboutImg, setAboutImg] = useState(getAboutImage())
  const [galleryImgs, setGalleryImgs] = useState(getGalleryImages())
  const [featuredImgs, setFeaturedImgs] = useState(getFeaturedImages())
  const [igImgs, setIgImgs] = useState(getInstagramImages())
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('gallery')

  const handleSaveAll = () => {
    saveImages('hero', heroImg)
    saveImages('about', aboutImg)
    saveImages('gallery', galleryImgs)
    saveImages('featured', featuredImgs)
    saveImages('instagram', igImgs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetAll = () => {
    setHeroImg(defaultHeroImage)
    setAboutImg(defaultAboutImage)
    setGalleryImgs(defaultGalleryImages)
    setFeaturedImgs(defaultFeaturedImages)
    setIgImgs(defaultInstagramImages)
    localStorage.removeItem('shotbyseven_hero')
    localStorage.removeItem('shotbyseven_about')
    localStorage.removeItem('shotbyseven_gallery')
    localStorage.removeItem('shotbyseven_featured')
    localStorage.removeItem('shotbyseven_instagram')
  }

  // --- Gallery handlers ---
  const addGalleryPhotos = useCallback(async (files) => {
    const urls = await Promise.all(files.map(fileToDataURL))
    const newImgs = urls.map(url => ({
      src: url,
      category: 'Portrait',
      aspect: 'tall',
      title: ''
    }))
    setGalleryImgs(prev => [...prev, ...newImgs])
  }, [])

  const removeGalleryPhoto = (index) => {
    setGalleryImgs(prev => prev.filter((_, i) => i !== index))
  }

  const updateGalleryPhoto = (index, key, value) => {
    setGalleryImgs(prev => prev.map((img, i) => i === index ? { ...img, [key]: value } : img))
  }

  // --- Featured handlers ---
  const addFeaturedPhotos = useCallback(async (files) => {
    const urls = await Promise.all(files.map(fileToDataURL))
    const newImgs = urls.map((url, i) => ({
      src: url,
      label: `Photo ${featuredImgs.length + i + 1}`
    }))
    setFeaturedImgs(prev => [...prev, ...newImgs])
  }, [featuredImgs.length])

  const removeFeaturedPhoto = (index) => {
    setFeaturedImgs(prev => prev.filter((_, i) => i !== index))
  }

  // --- Instagram handlers ---
  const addIgPhotos = useCallback(async (files) => {
    const urls = await Promise.all(files.map(fileToDataURL))
    setIgImgs(prev => [...prev, ...urls])
  }, [])

  const removeIgPhoto = (index) => {
    setIgImgs(prev => prev.filter((_, i) => i !== index))
  }

  // --- Hero/About handlers ---
  const handleHeroUpload = useCallback(async (files) => {
    const url = await fileToDataURL(files[0])
    setHeroImg(url)
  }, [])

  const handleAboutUpload = useCallback(async (files) => {
    const url = await fileToDataURL(files[0])
    setAboutImg(url)
  }, [])

  const tabs = [
    { key: 'gallery', label: 'Gallery', count: galleryImgs.length },
    { key: 'featured', label: 'Featured Strip', count: featuredImgs.length },
    { key: 'instagram', label: 'Instagram', count: igImgs.length },
    { key: 'hero', label: 'Hero & About', count: null },
  ]

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-ink/95 backdrop-blur border-b border-cream/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-cream/40 hover:text-gold transition-colors">
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold">
                Image <span className="text-gold">Manager</span>
              </h1>
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">
                Upload & manage your photos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetAll}
              className="font-heading text-[10px] tracking-[0.15em] uppercase px-4 py-2 text-cream/30 hover:text-cream/60 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={handleSaveAll}
              className={`font-heading text-[10px] tracking-[0.15em] uppercase px-6 py-2.5 transition-all duration-300 flex items-center gap-2 ${
                saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gold text-ink hover:bg-gold-light'
              }`}
            >
              {saved ? <><HiCheck className="w-4 h-4" /> Saved!</> : 'Save All'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-heading text-[10px] tracking-[0.15em] uppercase px-5 py-3 transition-all duration-300 whitespace-nowrap border-b-2 ${
                activeTab === tab.key
                  ? 'border-gold text-gold'
                  : 'border-transparent text-cream/30 hover:text-cream/60'
              }`}
            >
              {tab.label} {tab.count !== null && <span className="text-cream/20 ml-1">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div>
            <DropZone onFiles={addGalleryPhotos} label="Drop gallery photos here or click to upload" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {galleryImgs.map((img, i) => (
                <div key={i}>
                  <ImageThumb src={img.src} onRemove={() => removeGalleryPhoto(i)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-ink/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        value={img.category}
                        onChange={(e) => updateGalleryPhoto(i, 'category', e.target.value)}
                        className="bg-warm-black text-cream/60 text-[10px] font-heading tracking-wider uppercase w-full mb-1 px-1 py-0.5 border border-cream/10 rounded"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select
                        value={img.aspect}
                        onChange={(e) => updateGalleryPhoto(i, 'aspect', e.target.value)}
                        className="bg-warm-black text-cream/60 text-[10px] font-heading tracking-wider uppercase w-full px-1 py-0.5 border border-cream/10 rounded"
                      >
                        {aspects.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </ImageThumb>
                </div>
              ))}
            </div>
            {galleryImgs.length === 0 && (
              <div className="text-center py-16">
                <HiPhotograph className="w-12 h-12 mx-auto text-cream/10 mb-4" />
                <p className="font-heading text-sm text-cream/20">No gallery photos yet. Upload some above!</p>
              </div>
            )}
          </div>
        )}

        {/* FEATURED STRIP TAB */}
        {activeTab === 'featured' && (
          <div>
            <DropZone onFiles={addFeaturedPhotos} label="Drop featured photos here or click to upload" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {featuredImgs.map((img, i) => (
                <div key={i}>
                  <ImageThumb src={img.src} onRemove={() => removeFeaturedPhoto(i)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-ink/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        value={img.label}
                        onChange={(e) => {
                          setFeaturedImgs(prev => prev.map((m, j) => j === i ? { ...m, label: e.target.value } : m))
                        }}
                        placeholder="Label"
                        className="bg-warm-black text-cream/60 text-[10px] font-heading tracking-wider w-full px-1 py-0.5 border border-cream/10 rounded"
                      />
                    </div>
                  </ImageThumb>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSTAGRAM TAB */}
        {activeTab === 'instagram' && (
          <div>
            <DropZone onFiles={addIgPhotos} label="Drop Instagram-style photos here (square works best)" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
              {igImgs.map((src, i) => (
                <ImageThumb key={i} src={src} onRemove={() => removeIgPhoto(i)} />
              ))}
            </div>
          </div>
        )}

        {/* HERO & ABOUT TAB */}
        {activeTab === 'hero' && (
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">Hero Background</h3>
              <div className="aspect-video overflow-hidden rounded mb-4 bg-warm-black">
                <img src={heroImg} alt="Hero" className="w-full h-full object-cover" />
              </div>
              <DropZone onFiles={handleHeroUpload} label="Upload hero background" multiple={false} />
            </div>
            <div>
              <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gold mb-4">About Photo</h3>
              <div className="aspect-[3/4] overflow-hidden rounded mb-4 bg-warm-black max-w-[300px]">
                <img src={aboutImg} alt="About" className="w-full h-full object-cover" />
              </div>
              <DropZone onFiles={handleAboutUpload} label="Upload about photo" multiple={false} />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-16 border border-cream/5 rounded-lg p-6 bg-warm-black/50">
          <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gold mb-3">How it works</h3>
          <ul className="space-y-2 font-body text-sm text-cream/30 leading-relaxed">
            <li>• <strong className="text-cream/50">Upload</strong> — Drag & drop or click to upload your photos</li>
            <li>• <strong className="text-cream/50">Organize</strong> — Set categories and aspect ratios for gallery images</li>
            <li>• <strong className="text-cream/50">Save</strong> — Click "Save All" to apply changes to the site</li>
            <li>• <strong className="text-cream/50">Pro tip</strong> — For best results, use high-res images (1200px+ wide)</li>
            <li>• <strong className="text-cream/50">Permanent photos</strong> — To keep photos after deploy, add them to <code className="text-gold/60 bg-ink px-1 py-0.5 rounded text-[11px]">/public/photos/</code> and update <code className="text-gold/60 bg-ink px-1 py-0.5 rounded text-[11px]">src/imageConfig.js</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
