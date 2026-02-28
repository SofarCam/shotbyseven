import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronLeft, HiChevronRight, HiClock, HiCalendar } from 'react-icons/hi'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatDisplayTime(time24) {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
}

function formatEndTime(time24) {
  const [h, m] = time24.split(':').map(Number)
  const endH = h + 2
  const ampm = endH >= 12 ? 'pm' : 'am'
  const h12 = endH % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
}

// How many days to show per page and how far out to allow booking
const PAGE_DAYS = 28       // show 4 weeks at a time
const MAX_DAYS_OUT = 365   // allow booking up to 1 year in advance

export default function BookingCalendar({ onSelect, selectedDate, selectedTime }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_OUT)

  const [viewStart, setViewStart] = useState(() => new Date(tomorrow))
  const [availability, setAvailability] = useState({}) // { 'YYYY-MM-DD': ['09:00', '11:00', ...] }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('') // 'live' or 'mock'

  // PAGE_DAYS window
  const viewDays = Array.from({ length: PAGE_DAYS }, (_, i) => {
    const d = new Date(viewStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const viewEnd = viewDays[viewDays.length - 1]

  useEffect(() => {
    fetchAvailability()
  }, [viewStart])

  const fetchAvailability = async () => {
    setLoading(true)
    setError('')
    try {
      const startStr = viewStart.toISOString().split('T')[0]
      const endStr = viewEnd.toISOString().split('T')[0]
      const res = await fetch(`/api/availability?start=${startStr}&end=${endStr}`)
      if (!res.ok) throw new Error('Failed to fetch availability')
      const data = await res.json()
      const map = {}
      for (const day of data.days || []) {
        map[day.date] = day.slots
      }
      setAvailability(map)
      setSource(data.source || '')
    } catch (err) {
      setError('Could not load availability — pick a date manually below.')
      setAvailability({})
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    const d = new Date(viewStart)
    d.setDate(d.getDate() - PAGE_DAYS)
    if (d < tomorrow) return
    setViewStart(d)
  }

  const goForward = () => {
    const d = new Date(viewStart)
    d.setDate(d.getDate() + PAGE_DAYS)
    if (d > maxDate) return
    setViewStart(d)
  }

  const canGoBack = viewStart > new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
  const canGoForward = viewEnd < maxDate

  const handleSelectSlot = (dateStr, time) => {
    onSelect({ date: dateStr, time })
  }

  const selectedKey = selectedDate && selectedTime ? `${selectedDate}-${selectedTime}` : null

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiCalendar className="text-gold w-4 h-4" />
          <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold">
            Live Availability
          </span>
          {source === 'live' && (
            <span className="font-heading text-[9px] tracking-[0.1em] uppercase text-green-400/60 border border-green-400/20 px-2 py-0.5">
              Live
            </span>
          )}
          {source === 'mock' && (
            <span className="font-heading text-[9px] tracking-[0.1em] uppercase text-cream/20 border border-cream/10 px-2 py-0.5">
              Estimated
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack || loading}
            className="p-1.5 border border-cream/10 text-cream/40 hover:border-gold/30 hover:text-gold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={loading || !canGoForward}
            className="p-1.5 border border-cream/10 text-cream/40 hover:border-gold/30 hover:text-gold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date range label */}
      <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-cream/20 mb-4">
        {viewStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
        {viewEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      {loading && (
        <div className="text-center py-8">
          <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-gold/40 animate-pulse">
            Checking Cam's calendar...
          </p>
        </div>
      )}

      {error && (
        <p className="text-cream/30 text-xs font-body mb-4 border border-cream/10 p-3">{error}</p>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewStart.toISOString()}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {viewDays.map((day) => {
              const dateStr = day.toISOString().split('T')[0]
              const slots = availability[dateStr] || []
              const isToday = day.toDateString() === today.toDateString()
              const dow = day.getDay()
              const isSunday = dow === 0

              if (isSunday) return null

              return (
                <div key={dateStr} className="border border-cream/10 hover:border-cream/20 transition-colors">
                  {/* Day header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-cream/5">
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-[9px] tracking-[0.2em] uppercase text-cream/30">
                        {DAY_LABELS[dow]}
                      </span>
                      <span className="font-display text-sm text-cream/70">
                        {MONTH_LABELS[day.getMonth()].slice(0, 3)} {day.getDate()}
                      </span>
                    </div>
                    {slots.length === 0 && !loading && (
                      <span className="font-heading text-[9px] tracking-[0.1em] uppercase text-cream/15">
                        Unavailable
                      </span>
                    )}
                    {slots.length > 0 && (
                      <span className="font-heading text-[9px] tracking-[0.1em] uppercase text-gold/40">
                        {slots.length} slot{slots.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Time slots */}
                  {slots.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3">
                      {slots.map((time) => {
                        const key = `${dateStr}-${time}`
                        const isSelected = selectedKey === key
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleSelectSlot(dateStr, time)}
                            className={`flex items-center gap-1.5 px-3 py-2 border font-heading text-[10px] tracking-[0.1em] transition-all duration-200 ${
                              isSelected
                                ? 'border-gold bg-gold text-ink'
                                : 'border-cream/10 text-cream/50 hover:border-gold/50 hover:text-gold'
                            }`}
                          >
                            <HiClock className="w-3 h-3" />
                            {formatDisplayTime(time)} – {formatEndTime(time)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Selected slot summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 border border-gold/40 bg-gold/5 flex items-center justify-between"
        >
          <div>
            <p className="font-heading text-[9px] tracking-[0.2em] uppercase text-gold/50 mb-0.5">Selected</p>
            <p className="text-cream text-sm">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
              {' · '}
              {formatDisplayTime(selectedTime)} – {formatEndTime(selectedTime)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect({ date: '', time: '' })}
            className="text-cream/20 hover:text-cream/50 text-xs transition-colors"
          >
            Clear
          </button>
        </motion.div>
      )}
    </div>
  )
}
