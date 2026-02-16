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
import Booking from './components/Booking'
import Testimonials from './components/Testimonials'
import InstagramFeed from './components/InstagramFeed'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ImageManager from './components/ImageManager'
import ChatBot from './components/ChatBot'

function HomePage() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
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
            <Services />
            <SectionDivider />
            <Booking />
            <Testimonials />
            <SectionDivider />
            <InstagramFeed />
            <Contact />
          </main>
          <Footer />
          <ChatBot />
        </>
      )}
    </>
  )
}

function ManagePage() {
  const navigate = useNavigate()
  return <ImageManager onBack={() => navigate('/')} />
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
