import { useState, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Intro from './components/Intro'
import CustomCursor from './components/CustomCursor'
import FilmGrain from './components/FilmGrain'
import ScrollProgress from './components/ScrollProgress'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import FeaturedStrip from './components/FeaturedStrip'
import SectionDivider from './components/SectionDivider'
import About from './components/About'
import Gallery from './components/Gallery'
import Services from './components/Services'
import PricingCalculator from './components/PricingCalculator'
import SmartBooking from './components/SmartBooking'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatBot from './components/ChatBot'
import { GemTracker } from './components/HiddenGems'

// Lazy-loaded routes — only downloaded when visited
const ManageInner   = lazy(() => import('./components/ImageManager'))
const PasswordGate  = lazy(() => import('./components/PasswordGate'))
const ContractSign  = lazy(() => import('./components/ContractSign'))
const ClientPortal  = lazy(() => import('./components/ClientPortal'))
const Blog          = lazy(() => import('./components/Blog'))
const BlogPost      = lazy(() => import('./components/BlogPost'))
const StudioPage    = lazy(() => import('./components/StudioPage'))
const ThankYou      = lazy(() => import('./components/ThankYou'))

// Minimal fallback that matches the site's dark background
function PageLoader() {
  return <div className="min-h-screen bg-ink" />
}

function HomePage() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  const handleServiceSelect = useCallback((serviceId) => {
    void serviceId
    setTimeout(() => {
      const el = document.getElementById('smart-booking')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  return (
    <>
      <Intro onComplete={handleIntroComplete} />
      <CustomCursor />
      <FilmGrain />

      {introComplete && (
        <>
          <ScrollProgress />
          <Navbar />
          <main>
            <Hero />
            <Marquee />
            <FeaturedStrip />
            <SectionDivider />
            <About />
            <SectionDivider />
            <Gallery />
            <Marquee />
            <Services onServiceSelect={handleServiceSelect} />
            <SectionDivider />
            <PricingCalculator onBookNow={handleServiceSelect} />
            <SectionDivider />
            <SmartBooking />
            <Testimonials />
            <SectionDivider />
            <FAQ />
            <SectionDivider />
            <Contact />
          </main>
          <Footer />
          <ChatBot />
          <GemTracker />
        </>
      )}
    </>
  )
}

function ManagePage() {
  const navigate = useNavigate()
  return (
    <Suspense fallback={<PageLoader />}>
      <CustomCursor />
      <PasswordGate>
        <ManageInner onBack={() => navigate('/')} />
      </PasswordGate>
    </Suspense>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/manage" element={<ManagePage />} />
      <Route
        path="/contract/:bookingId"
        element={<Suspense fallback={<PageLoader />}><ContractSign /></Suspense>}
      />
      <Route
        path="/contract"
        element={<Suspense fallback={<PageLoader />}><ContractSign /></Suspense>}
      />
      <Route
        path="/portal"
        element={<Suspense fallback={<PageLoader />}><ClientPortal /></Suspense>}
      />
      <Route
        path="/portal/:bookingId"
        element={<Suspense fallback={<PageLoader />}><ClientPortal /></Suspense>}
      />
      <Route
        path="/blog"
        element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>}
      />
      <Route
        path="/blog/:slug"
        element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>}
      />
      <Route
        path="/studio"
        element={<Suspense fallback={<PageLoader />}><StudioPage /></Suspense>}
      />
      <Route
        path="/thank-you"
        element={<Suspense fallback={<PageLoader />}><ThankYou /></Suspense>}
      />
    </Routes>
  )
}

export default App
