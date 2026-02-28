import { google } from 'googleapis'

// Vercel serverless function
// GET /api/availability?start=2026-02-24&end=2026-03-10
// Returns available 2-hour slots for each day based on Cam's Google Calendar

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'shotbyseven777@gmail.com'
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON // JSON string of service account key

// Business hours (Charlotte ET)
const DAY_START_HOUR = 9   // 9am
const DAY_END_HOUR = 20    // 8pm
const SLOT_DURATION = 2    // hours
const BUFFER_MINUTES = 30  // buffer before/after bookings

function generateSlots(dayStart, dayEnd) {
  const slots = []
  const current = new Date(dayStart)
  current.setHours(DAY_START_HOUR, 0, 0, 0)

  while (current.getHours() + SLOT_DURATION <= DAY_END_HOUR) {
    slots.push(new Date(current))
    current.setHours(current.getHours() + 1)
  }
  return slots
}

function isSlotFree(slotStart, busyPeriods) {
  const slotEnd = new Date(slotStart)
  slotEnd.setHours(slotEnd.getHours() + SLOT_DURATION)

  // Add buffer
  const bufferedStart = new Date(slotStart)
  bufferedStart.setMinutes(bufferedStart.getMinutes() - BUFFER_MINUTES)
  const bufferedEnd = new Date(slotEnd)
  bufferedEnd.setMinutes(bufferedEnd.getMinutes() + BUFFER_MINUTES)

  for (const period of busyPeriods) {
    const busyStart = new Date(period.start)
    const busyEnd = new Date(period.end)
    // Overlap check
    if (bufferedStart < busyEnd && bufferedEnd > busyStart) return false
  }
  return true
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Parse date range
  const { start, end } = req.query
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' })
  }

  const startDate = new Date(start + 'T00:00:00-05:00')
  const endDate = new Date(end + 'T23:59:59-05:00')

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' })
  }

  // Enforce max 1 year out
  const oneYearOut = new Date()
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1)
  if (endDate > oneYearOut) {
    return res.status(400).json({ error: 'Cannot query more than 1 year out' })
  }

  // If no service account configured, return mock available slots
  if (!SERVICE_ACCOUNT_JSON) {
    const days = []
    const cursor = new Date(startDate)
    while (cursor <= endDate) {
      const dayStr = cursor.toISOString().split('T')[0]
      const dow = cursor.getDay()
      // Skip Sundays
      if (dow !== 0) {
        // Mock: Saturdays fewer slots, weekdays full
        const slots = dow === 6
          ? ['10:00', '12:00', '14:00']
          : ['09:00', '11:00', '13:00', '15:00', '17:00']
        days.push({ date: dayStr, slots })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return res.status(200).json({ days, source: 'mock' })
  }

  try {
    // Auth with service account
    const keyData = JSON.parse(SERVICE_ACCOUNT_JSON)
    const auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Fetch busy periods via freebusy query
    const freebusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        timeZone: 'America/New_York',
        items: [{ id: CALENDAR_ID }],
      },
    })

    const busyPeriods = freebusyRes.data.calendars?.[CALENDAR_ID]?.busy || []

    // Generate available slots per day
    const days = []
    const cursor = new Date(startDate)

    while (cursor <= endDate) {
      const dow = cursor.getDay()
      // Skip Sundays (0) — optional: remove if Cam works Sundays
      if (dow !== 0) {
        const dayStart = new Date(cursor)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(cursor)
        dayEnd.setHours(23, 59, 59, 999)

        const candidateSlots = generateSlots(dayStart, dayEnd)
        const freeSlots = candidateSlots
          .filter(slot => isSlotFree(slot, busyPeriods))
          .map(slot => slot.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false,
            timeZone: 'America/New_York',
          }))

        days.push({
          date: cursor.toISOString().split('T')[0],
          slots: freeSlots,
        })
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    return res.status(200).json({ days, source: 'live' })

  } catch (err) {
    console.error('Availability API error:', err)
    return res.status(500).json({ error: 'Failed to fetch availability', detail: err.message })
  }
}
