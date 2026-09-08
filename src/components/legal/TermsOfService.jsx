import { Link } from 'react-router-dom'
import LegalLayout, { LegalSection } from './LegalLayout'

export default function TermsOfService() {
  return (
    <LegalLayout eyebrow="Shot by Seven" title="Terms of Service" lastUpdated="September 8, 2026">

      <LegalSection heading="Agreement to terms">
        <p>
          These Terms govern your use of shotbyseven.com and the photography services offered by Cameron Currence,
          operating as Shot by Seven, in Charlotte, North Carolina. By using this site or booking a session, you agree
          to these Terms. If you book a session, you'll also sign a separate, session-specific Photography Services
          Agreement — where the two differ on booking specifics, the signed agreement controls.
        </p>
      </LegalSection>

      <LegalSection heading="Our services">
        <p>
          Shot by Seven provides professional photography services (portrait, graduation, maternity, fashion, event,
          and studio sessions) in the Charlotte, NC area, along with an informational website, blog, online booking
          forms, a client status portal, and a studio booking tool for our partner space at NoDa Art House.
        </p>
      </LegalSection>

      <LegalSection heading="Booking, deposits &amp; cancellations">
        <p>This is a summary of our standard booking terms. Full terms are in the Photography Services Agreement you sign after booking.</p>
        <ul>
          <li>A non-refundable deposit is required to reserve and confirm your session date. No date is held without it.</li>
          <li>The remaining session balance is due on or before the day of the session.</li>
          <li>Studio fees (NoDa Art House) are billed separately from the session rate.</li>
          <li>You may reschedule at no charge with at least 48 hours' notice. Cancellations within 24 hours of the session forfeit the deposit.</li>
          <li>If we need to cancel due to illness, emergency, or circumstances beyond our control, you'll be offered a full reschedule or a full refund.</li>
          <li>Weather-related postponements are handled collaboratively, including a studio alternative where available.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Pricing">
        <p>
          Current rates are shown on the homepage pricing calculator and are billed at $50/hour with a 2-hour minimum
          for most session types; graduation and maternity/family sessions have a $250 minimum. Studio time and travel
          outside the Charlotte area are billed separately as disclosed at booking. Prices are subject to change; the
          rate confirmed at the time of your booking is what applies to your session.
        </p>
      </LegalSection>

      <LegalSection heading="Referral &amp; loyalty programs">
        <p>
          Returning clients with three or more prior sessions may qualify for a loyalty discount, verified at
          checkout. Referral credits are applied manually by Shot by Seven after verification and are offered at our
          discretion — they are not an automatic account credit, and the referral program may be changed or
          discontinued at any time without notice.
        </p>
      </LegalSection>

      <LegalSection heading="Image delivery, copyright &amp; usage">
        <ul>
          <li>You'll receive a preview gallery within 48–72 hours and your full edited gallery via PicTime within about 7 business days, accessible for 90 days.</li>
          <li>Shot by Seven retains copyright of all photographs. You're granted a personal-use license to download, print, and share your images — not to resell or use them commercially without written permission.</li>
          <li>Unless you opt out in writing before your session, Shot by Seven may use session images for portfolio, website, and social media marketing purposes. This is detailed further, with the opt-out process, in your signed session agreement.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Acceptable use of this website">
        <p>You agree not to:</p>
        <ul>
          <li>Submit false or fraudulent information through our forms.</li>
          <li>Attempt to access password-protected areas of the site without authorization.</li>
          <li>Scrape, spam, or abuse our booking forms, chat assistant, or contact channels.</li>
          <li>Use this site or its content for any unlawful purpose.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Third-party links &amp; services">
        <p>
          This site links to and integrates with third-party services (Instagram, PicTime, NoDa Art House, Stripe, and
          others). We aren't responsible for the content, availability, or privacy practices of those third-party
          sites — see our <Link to="/privacy">Privacy Policy</Link> for what data is shared with each.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimer &amp; limitation of liability">
        <p>
          This website and its content are provided "as is" without warranties of any kind. We aren't liable for
          indirect, incidental, or consequential damages arising from your use of the site. For session-specific
          liability terms (equipment failure, weather, etc.), see your signed Photography Services Agreement, which
          controls for booked sessions.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These Terms are governed by the laws of the State of North Carolina, without regard to conflict-of-law
          principles. Any disputes are subject to the exclusive jurisdiction of the courts of Mecklenburg County,
          North Carolina.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>We may update these Terms as our services change. The date at the top reflects the most recent revision.</p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions: <a href="mailto:shotbyseven777@gmail.com">shotbyseven777@gmail.com</a>. See also our{' '}
          <Link to="/privacy">Privacy Policy</Link> and <Link to="/accessibility">Accessibility Statement</Link>.
        </p>
      </LegalSection>

    </LegalLayout>
  )
}
