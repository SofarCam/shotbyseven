// Deposit collection uses two fixed-price Stripe Payment Links — $50 for
// sessions under $300, $100 for $300+ (see depositAmount logic in
// SmartBooking.jsx / ClientPortal.jsx). Falls back to the $100 link for any
// other amount rather than picking silently wrong.
const DEPOSIT_URLS = {
  50: 'https://buy.stripe.com/9B614nfsk8bFfULdL18og01',
  100: 'https://buy.stripe.com/00w00ja802Rl5g74ar8og00',
}

export function getDepositUrl(amount) {
  return DEPOSIT_URLS[amount] || DEPOSIT_URLS[100]
}
