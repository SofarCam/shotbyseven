import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const HASH_KEY = import.meta.env.VITE_MANAGE_PASSWORD_HASH || ''

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('manage_authenticated') === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const hashed = await hashPassword(password.trim())
      if (hashed === HASH_KEY) {
        sessionStorage.setItem('manage_authenticated', 'true')
        setAuthenticated(true)
      } else {
        setError('Incorrect password')
        setPassword('')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('manage_authenticated')
    setAuthenticated(false)
    setPassword('')
  }

  if (authenticated) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="font-heading text-[10px] tracking-[0.2em] uppercase px-4 py-2 border border-cream/10 text-cream/30 hover:text-gold hover:border-gold/30 transition-colors"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="font-display text-2xl font-bold text-gold">S</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-cream mb-2">Image Manager</h1>
          <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30">
            Authorized Access Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-heading text-[10px] tracking-[0.2em] uppercase text-cream/30 block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              className="w-full bg-transparent border-b border-cream/10 focus:border-gold py-3 text-cream outline-none transition-colors duration-300 placeholder-cream/15"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400/80 text-xs font-heading tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !password.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gold text-ink font-heading text-sm tracking-widest uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-30"
          >
            {loading ? 'Verifying...' : 'Access Manager'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
