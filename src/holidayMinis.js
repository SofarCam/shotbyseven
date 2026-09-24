// Holiday Mini Sessions — edit this block to change the event.
// Leave `date` as null until the date is confirmed; the page then shows
// "date announced soon" and collects requests instead of bookings.

export const HOLIDAY_MINIS = {
  date: null, // e.g. '2026-11-14' (YYYY-MM-DD)
  timeWindow: '10am – 2pm',
  location: 'Studio A, NoDa Art House — 3109 Cullman Ave, Charlotte',
  price: 149,
  minutes: 20,
  photos: 12,
  maxPeople: 5,
  deliveryDays: 7,
  checkoutUrl: import.meta.env.VITE_STRIPE_HOLIDAY_MINI_URL,
}

export function formatMiniDate(date) {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}
