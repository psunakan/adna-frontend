import { BRAND, CONTACT_EMAIL, ORG_SHORT, escapeHtml } from './branding.ts'
import {
  emailButtonStack,
  emailHeading,
  emailHighlightCard,
  emailLead,
  emailMuted,
  emailParagraph,
  wrapEmailLayout,
} from './baseLayout.ts'

export type RegistrationEmailData = {
  firstName: string
  membershipLabel: string
  siteUrl: string
}

export const REGISTRATION_EMAIL_SUBJECT = 'Welcome to A-DNA — your membership is confirmed'

export function buildRegistrationEmailHtml(data: RegistrationEmailData) {
  const firstName = escapeHtml(data.firstName)
  const membershipLabel = escapeHtml(data.membershipLabel)
  const siteUrl = data.siteUrl.replace(/\/$/, '')
  const portalUrl = `${siteUrl}/portal/login`

  const bodyHtml = `
    ${emailHeading(`Welcome, ${firstName}!`)}
    ${emailLead(
      `Thank you for joining the African-Diaspora Nursing Alliance. Your membership payment has been received and your account is now active.`,
    )}
    ${emailHighlightCard('Membership tier', membershipLabel)}
    ${emailParagraph('You can sign in to the member portal to view your profile, upgrade your tier, and access member resources.')}
    ${emailButtonStack([
      { href: portalUrl, label: 'Go to Member Portal' },
      { href: siteUrl, label: 'Visit A-DNA website', variant: 'secondary' },
    ])}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;padding-top:24px;border-top:1px solid ${BRAND.border};">
      <tr>
        <td>
          ${emailMuted(
            `Questions? Reply to this email or contact us at <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.greenLight};font-weight:600;text-decoration:none;">${CONTACT_EMAIL}</a>.`,
          )}
        </td>
      </tr>
    </table>`

  return wrapEmailLayout({
    preheader: `Your ${data.membershipLabel} payment was received. Welcome to ${ORG_SHORT}.`,
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

Membership tier: ${data.membershipLabel}

Member Portal: ${portalUrl}
Visit our website: ${siteUrl}

Questions? Contact us at ${CONTACT_EMAIL}

---
African-Diaspora Nursing Alliance (A-DNA)
${siteUrl}`
}
