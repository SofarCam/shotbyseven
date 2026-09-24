import { BUSINESS } from './config/business'

// Holiday Mini Sessions — edit this block to change the event.
// Add a date (YYYY-MM-DD) to `dates` once it's confirmed; the page lists every
// date and lets people pick one. With no dates, the page collects
// "notify me" sign-ups instead.

export const HOLIDAY_MINIS = {
  dates: ['2026-10-24'],
  moreDatesComing: true, // shows "more dates coming" under the list
  timeWindow: '10am – 2pm',
  location: `Studio A, NoDa Art House — ${BUSINESS.studio.street}, ${BUSINESS.studio.city}`,
  price: 149,
  minutes: 20,
  photos: 14,
  maxPeople: 5,
  deliveryDays: 7,
  checkoutUrl: import.meta.env.VITE_STRIPE_HOLIDAY_MINI_URL,
}

export function formatMiniDate(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

// Only dates that haven't passed yet
export function upcomingMiniDates(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return HOLIDAY_MINIS.dates
    .filter((d) => {
      const [y, m, day] = d.split('-').map(Number)
      return new Date(y, m - 1, day) >= today
    })
    .sort()
}
