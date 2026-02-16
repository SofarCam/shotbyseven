import emailjs from '@emailjs/browser'

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const BOOKING_TEMPLATE = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE || ''
const CONTACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE || ''

// Initialize EmailJS
if (PUBLIC_KEY) {
  emailjs.init(PUBLIC_KEY)
}

export async function sendBookingEmail(formData, packageInfo) {
  if (!PUBLIC_KEY || !SERVICE_ID || !BOOKING_TEMPLATE) {
    console.warn('EmailJS not configured — booking data:', { formData, packageInfo })
    // Still return success so the UI flow works during development
    return { status: 200, text: 'OK (dev mode)' }
  }

  const templateParams = {
    to_email: 'shotbyseven777@gmail.com',
    from_name: formData.name,
    from_email: formData.email,
    phone: formData.phone || 'Not provided',
    preferred_contact: formData.preferredContact || 'Email',
    package_name: packageInfo?.label || 'Not specified',
    package_price: packageInfo?.price || '',
    preferred_date: formData.date,
    event_type: formData.eventType || '',
    message: formData.message || 'No additional details',
  }

  return emailjs.send(SERVICE_ID, BOOKING_TEMPLATE, templateParams)
}

export async function sendContactEmail(formData) {
  if (!PUBLIC_KEY || !SERVICE_ID || !CONTACT_TEMPLATE) {
    console.warn('EmailJS not configured — contact data:', formData)
    return { status: 200, text: 'OK (dev mode)' }
  }

  const templateParams = {
    to_email: 'shotbyseven777@gmail.com',
    from_name: formData.name,
    from_email: formData.email,
    phone: formData.phone || 'Not provided',
    preferred_contact: formData.preferredContact || 'Email',
    message: formData.message,
  }

  return emailjs.send(SERVICE_ID, CONTACT_TEMPLATE, templateParams)
}
