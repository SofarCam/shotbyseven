import emailjs from '@emailjs/browser'

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const BOOKING_TEMPLATE = import.meta.env.VITE_EMAILJS_BOOKING_TEMPLATE || ''
const CONTACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE || ''
const CONTRACT_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTRACT_TEMPLATE || ''
const CRM_URL = import.meta.env.VITE_CRM_WEBHOOK_URL || ''

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
    reply_to: formData.email,
    from_name: formData.name,
    from_email: formData.email,
    phone: formData.phone || 'Not provided',
    preferred_contact: formData.preferredContact || 'Email',
    package_name: packageInfo?.label || 'Not specified',
    package_price: packageInfo?.price || '',
    preferred_date: formData.date,
    event_type: formData.eventType || '',
    message: formData.message || 'No additional details',
    booking_id: formData.bookingId || '',
    portal_url: formData.portalUrl || '',
    stripe_url: formData.stripeUrl || 'Payment link coming soon',
    deposit_amount: formData.depositAmount ? `$${formData.depositAmount}` : '',
    photo_references: formData.photoReferences || 'None attached',
    photo_count: String(formData.photoCount || 0),
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
    instagram_handle: formData.instagramHandle ? `@${formData.instagramHandle}` : 'N/A',
    message: formData.message,
  }

  return emailjs.send(SERVICE_ID, CONTACT_TEMPLATE, templateParams)
}

export async function sendContractEmail({ clientName, clientEmail, bookingId, signedDate, signatureImage }) {
  if (!PUBLIC_KEY || !SERVICE_ID || !BOOKING_TEMPLATE) {
    console.warn('Contract EmailJS not configured — contract data:', { clientName, clientEmail, bookingId, signedDate })
    return { status: 200, text: 'OK (dev mode)' }
  }

  // Routes through booking template — no 3rd template slot needed
  const templateParams = {
    to_email: 'shotbyseven777@gmail.com',
    reply_to: clientEmail,
    from_name: clientName,
    from_email: clientEmail,
    phone: 'N/A',
    preferred_contact: 'Email',
    package_name: '📝 CONTRACT SIGNED',
    package_price: '',
    preferred_date: signedDate,
    event_type: 'Contract',
    message: `Contract signed for Booking #${bookingId}.\n\nClient: ${clientName}\nEmail: ${clientEmail}\nSigned: ${signedDate}`,
    booking_id: bookingId,
    portal_url: '',
    stripe_url: '',
    deposit_amount: '',
    photo_references: 'N/A',
    photo_count: '0',
  }

  return emailjs.send(SERVICE_ID, BOOKING_TEMPLATE, templateParams)
}

export function logContractToCRM(data) {
  if (!CRM_URL) return
  fetch(CRM_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch((e) => console.warn('Contract CRM log failed (non-blocking):', e))
}
