import { Link } from 'react-router-dom'
import LegalLayout, { LegalSection } from './LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout eyebrow="Shot by Seven" title="Privacy Policy" lastUpdated="September 8, 2026">

      <LegalSection heading="Who we are">
        <p>
          Shot by Seven is a photography business operated by Cameron Currence, based in Charlotte, North Carolina.
          This policy explains what information we collect through <strong>shotbyseven.com</strong>, why we collect it,
          who we share it with, and the choices you have. If you have questions, email{' '}
          <a href="mailto:shotbyseven777@gmail.com">shotbyseven777@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <p>We collect information you give us directly through forms on this site, and limited technical information automatically.</p>
        <p><strong>Information you provide:</strong></p>
        <ul>
          <li><strong>Contact form:</strong> name, email, phone (optional), preferred contact method, Instagram handle, and your message.</li>
          <li><strong>Booking form:</strong> name, email, phone (optional), session type and details, requested dates/times, location, your budget, any reference photos you upload, and a referral code if you have one.</li>
          <li><strong>Studio booking form (/studio):</strong> name, email, shoot type, duration, headcount, requested dates, and special requests.</li>
          <li><strong>Contract signing:</strong> your name, email, and a hand-drawn signature image, used to execute the photography services agreement for a booked session.</li>
          <li><strong>Client portal:</strong> the email and booking ID you enter, used only to look up your booking status.</li>
          <li><strong>Blog newsletter:</strong> your email address, if you subscribe.</li>
          <li><strong>Instagram Direct Messages:</strong> if you message @shotbyseven777 on Instagram, your message is processed to send you an automated, AI-assisted reply and to notify Cam.</li>
        </ul>
        <p><strong>Information collected automatically (only with your consent for analytics/marketing — see "Cookies &amp; Tracking" below):</strong></p>
        <ul>
          <li>Pages visited, general device/browser information, and referral source, via Google Analytics.</li>
          <li>Ad-interaction data via the Meta (Facebook/Instagram) Pixel, used to measure ad performance.</li>
          <li>Basic performance metrics (page load speed) via Vercel Speed Insights. This runs regardless of your cookie choice because it does not identify you personally — it does not use cookies or collect IP-linked profiles.</li>
        </ul>
        <p>
          We do not collect payment card numbers. Deposit payments are processed entirely by Stripe — see "Payments" below.
        </p>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul>
          <li>To respond to inquiries and process session bookings.</li>
          <li>To communicate with you about your session — scheduling, contracts, deposits, and gallery delivery.</li>
          <li>To send you the newsletter, if you subscribed (you can unsubscribe anytime).</li>
          <li>To improve the site and understand what content and services people are interested in, if you've consented to analytics.</li>
          <li>To detect and prevent abuse of our forms and booking system.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection heading="Who we share information with">
        <p>
          We use the following third-party services to run this business. Each only receives the information needed to
          perform its function:
        </p>
        <ul>
          <li><strong>EmailJS</strong> — sends form submissions (name, email, phone, message content) to our business email.</li>
          <li><strong>Cloudinary</strong> — hosts reference photos you upload through the booking form.</li>
          <li><strong>Stripe</strong> — processes deposit payments. Stripe receives your email and booking reference; we never see or store your card details.</li>
          <li><strong>Google Sheets (via a private webhook)</strong> — our internal booking/lead tracker. Receives the fields from whichever form you submitted.</li>
          <li><strong>Google Calendar</strong> — used server-side only to check availability; does not receive your personal details.</li>
          <li><strong>PicTime</strong> — our third-party gallery delivery platform. Once you're a booked client, your delivered photo gallery lives on PicTime, governed by PicTime's own privacy policy.</li>
          <li><strong>Instagram / Meta Graph API</strong> — if you DM us on Instagram, your message is read via Instagram's official API to generate a reply and notify us.</li>
          <li><strong>Anthropic (Claude AI)</strong> — powers our automated Instagram DM assistant and internal content tools. Message text you send us on Instagram may be processed by this AI service to generate a response.</li>
          <li><strong>Telegram</strong> — used internally to notify Cam of new Instagram messages and bookings. This is our own private notification channel, not a public or advertising platform.</li>
          <li><strong>Resend</strong> — sends the blog subscriber notification email.</li>
          <li><strong>Google Fonts</strong> — loads our typefaces from Google's font servers, which — like any web font CDN — receives the requesting browser's IP address as a normal part of serving the font files.</li>
        </ul>
        <p>
          We do not require these providers to be GDPR- or CCPA-certified, as our services are currently offered to clients
          in the Charlotte, North Carolina area. If you are contacting us from outside the United States, please be aware
          your information will be processed in the U.S.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies &amp; tracking technologies">
        <p>
          We use Google Analytics and the Meta Pixel to understand site traffic and measure how well our marketing is
          working. <strong>Neither loads until you choose "Accept All" or turn it on individually</strong> in the cookie
          banner or the "Cookie Preferences" link in the footer. If you choose "Reject Non-Essential," neither script
          loads and neither sets tracking cookies.
        </p>
        <p>Technologies that are always active because the site cannot function properly without them:</p>
        <ul>
          <li>A session flag that keeps you logged into the password-protected admin tools.</li>
          <li>A flag that remembers you've dismissed the availability banner, for that browser session.</li>
          <li>A flag that skips the intro animation on repeat visits within the same session.</li>
        </ul>
        <p>
          You can change your cookie choice at any time using the <strong>Cookie Preferences</strong> link in the site
          footer.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention">
        <ul>
          <li>Delivered photo galleries remain accessible on PicTime for 90 days after delivery (see your session contract for details).</li>
          <li>Booking and lead records in our internal tracker are kept as long as reasonably needed for business, tax, and legal record-keeping purposes.</li>
          <li>Newsletter subscriber emails are kept until you unsubscribe or request removal.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Your choices &amp; rights">
        <p>
          You can ask us to access, correct, or delete the personal information we hold about you at any time by emailing{' '}
          <a href="mailto:shotbyseven777@gmail.com">shotbyseven777@gmail.com</a>. We'll respond within a reasonable time.
          North Carolina does not currently have a comprehensive state consumer privacy law, but we honor reasonable
          requests regardless. If you are a resident of a state or country with specific statutory privacy rights (such
          as California's CCPA or the EU's GDPR), let us know and we will do our best to accommodate applicable
          requirements — we recommend consulting an attorney if you need a formal compliance determination for your
          jurisdiction.
        </p>
      </LegalSection>

      <LegalSection heading="Children's privacy">
        <p>
          This site is not directed at children under 13, and we do not knowingly collect personal information from
          children. Photography sessions involving minors are booked and consented to by a parent or guardian.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          We take reasonable measures to protect the information you share with us, including routing sensitive
          requests through our own servers rather than exposing third-party credentials in the browser. No method of
          transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We may update this policy as the site and services change. The date at the top of this page reflects the
          most recent revision. Material changes will be reflected here.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy or your data: <a href="mailto:shotbyseven777@gmail.com">shotbyseven777@gmail.com</a>.
          See also our <Link to="/terms">Terms of Service</Link> and <Link to="/accessibility">Accessibility Statement</Link>.
        </p>
      </LegalSection>

    </LegalLayout>
  )
}
