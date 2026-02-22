import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import SmartBooking from './components/SmartBooking'
import Testimonials from './components/Testimonials'
// InstagramFeed removed — using static gallery instead
import Contact from './components/Contact'
import Footer from './components/Footer'
import ImageManager from './components/ImageManager'
import PasswordGate from './components/PasswordGate'
import ChatBot from './components/ChatBot'
import { GemTracker } from './components/HiddenGems'

function HomePage() {
  const [introComplete, setIntroComplete] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  const handleServiceSelect = useCallback((serviceId) => {
    setSelectedService(serviceId)
    setTimeout(() => {
      const el = document.getElementById('booking')
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
            <SmartBooking />
            <Testimonials />
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
    <>
      <CustomCursor />
      <PasswordGate>
        <ImageManager onBack={() => navigate('/')} />
      </PasswordGate>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/manage" element={<ManagePage />} />
    </Routes>
  )
}

export default App
