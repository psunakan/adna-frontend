import { BRAND, CONTACT_EMAIL, escapeHtml } from './branding.ts'
import { emailButton, wrapEmailLayout } from './baseLayout.ts'

export type RegistrationEmailData = {
  firstName: string
  membershipLabel: string
  siteUrl: string
}

export const REGISTRATION_EMAIL_SUBJECT = 'Welcome to A-DNA: your membership is confirmed'

export function buildRegistrationEmailHtml(data: RegistrationEmailData) {
  const firstName = escapeHtml(data.firstName)
  const membershipLabel = escapeHtml(data.membershipLabel)
  const siteUrl = data.siteUrl.replace(/\/$/, '')
  const portalUrl = `${siteUrl}/portal/login`

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-family:${BRAND.headingFont};font-size:26px;font-weight:800;color:${BRAND.green};line-height:1.3;">
      Welcome, ${firstName}!
    </h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:${BRAND.textMuted};">
      Thank you for joining the African-Diaspora Nursing Alliance (A-DNA). Your membership payment has been received.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
      You are now an active member at:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:${BRAND.highlightBg};border-left:4px solid ${BRAND.green};padding:16px 20px;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:17px;font-weight:700;color:${BRAND.green};line-height:1.5;">
            ${membershipLabel}
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;">
      Explore our community, events, and resources:
    </p>
    <p style="margin:0 0 28px;">
      ${emailButton(siteUrl, 'Visit A-DNA website')}
      ${emailButton(portalUrl, 'Member Portal', 'secondary')}
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.textMuted};">
      Questions? Reply to this email or contact us at
      <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.green};font-weight:600;text-decoration:none;">${CONTACT_EMAIL}</a>.
    </p>`

  return wrapEmailLayout({
    preheader: `Your ${data.membershipLabel} payment was received. Welcome to A-DNA.`,
    title: REGISTRATION_EMAIL_SUBJECT,
    bodyHtml,
    siteUrl,
  })
}

export function buildRegistrationEmailText(data: RegistrationEmailData) {
  const siteUrl = data.siteUrl.replace(/\/$/, '')
  const portalUrl = `${siteUrl}/portal/login`

  return `Welcome, ${data.firstName}!

Thank you for joining the African-Diaspora Nursing Alliance (A-DNA). Your membership payment has been received.

You are now an active member at:
${data.membershipLabel}

Visit our website: ${siteUrl}
Member Portal: ${portalUrl}

Questions? Contact us at ${CONTACT_EMAIL}

---
African-Diaspora Nursing Alliance (A-DNA)
${siteUrl}`
}
