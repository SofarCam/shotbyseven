import LegalLayout, { LegalSection } from './LegalLayout'

export default function AccessibilityStatement() {
  return (
    <LegalLayout
      eyebrow="Shot by Seven"
      title="Accessibility Statement"
      lastUpdated="September 8, 2026"
      path="/accessibility"
      description="Shot by Seven's accessibility commitment — our WCAG 2.2 AA target, what's been implemented, and how to report an accessibility issue."
    >

      <LegalSection heading="Our commitment">
        <p>
          Shot by Seven wants this website to be usable by as many people as possible, including people who use
          assistive technology like screen readers, switch devices, or keyboard-only navigation. We use the{' '}
          <strong>Web Content Accessibility Guidelines (WCAG) 2.2, Level AA</strong> as our target standard. We are not
          claiming full certification of compliance — accessibility is an ongoing effort, and we're actively working
          through improvements rather than treating this as finished.
        </p>
      </LegalSection>

      <LegalSection heading="What we've done">
        <ul>
          <li>Semantic HTML structure with a logical heading hierarchy on every page.</li>
          <li>Descriptive alt text on meaningful images; decorative images are marked so screen readers skip them.</li>
          <li>Form fields are paired with visible, programmatically-associated labels, including a keyboard-and-screen-reader-accessible file upload.</li>
          <li>Icon-only buttons (navigation arrows, close buttons, menu toggles) carry accessible names via <code>aria-label</code>.</li>
          <li>Visible keyboard focus states throughout the site.</li>
          <li><code>autocomplete</code> attributes on standard fields (name, email, phone) to support browser and assistive-tech autofill.</li>
          <li>A real, functioning cookie consent control rather than a decorative banner — see the "Cookie Preferences" link in the footer.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Known limitations">
        <p>We're aware of the following gaps and are working through them:</p>
        <ul>
          <li>A custom animated cursor is used decoratively on larger screens; it does not replace or interfere with your operating system's native cursor or focus indicators, but hasn't been independently tested with every assistive input device.</li>
          <li>Some third-party embeds (Instagram content, the PicTime gallery platform, embedded video players) are outside our direct control and follow their own providers' accessibility practices.</li>
          <li>The password-protected admin tools (<code>/manage</code>, <code>/content</code>) are internal, staff-only tools and have not been held to the same public-facing accessibility bar as the client-facing site.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Feedback &amp; accommodation requests">
        <p>
          If you encounter an accessibility barrier on this site, or need information in an alternative format,
          please email <a href="mailto:shotbyseven777@gmail.com">shotbyseven777@gmail.com</a>. We'll do our best to
          respond promptly and address the issue.
        </p>
      </LegalSection>

    </LegalLayout>
  )
}
