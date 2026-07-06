import { BRAND, escapeHtml } from './branding.ts'
import {
  emailButtonStack,
  emailHeading,
  emailLead,
  emailMuted,
  emailParagraph,
  wrapEmailLayout,
} from './baseLayout.ts'

export const PASSWORD_RESET_EMAIL_SUBJECT = 'Reset your A-DNA Member Portal password'

type PasswordResetEmailData = {
  firstName: string
  resetUrl: string
  siteUrl: string
}

export function buildPasswordResetEmailHtml({
  firstName,
  resetUrl,
  siteUrl,
}: PasswordResetEmailData) {
  const safeName = escapeHtml(firstName)
  const safeUrl = escapeHtml(resetUrl)

  const bodyHtml = `
    ${emailHeading('Reset your password')}
    ${emailParagraph(`Hello ${safeName},`, '12px')}
    ${emailLead(
      'We received a request to set or reset your A-DNA Member Portal password. Tap the button below to choose a new password.',
    )}
    ${emailButtonStack([{ href: resetUrl, label: 'Reset password' }])}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;padding:20px;background-color:${BRAND.highlightBg};border:1px solid ${BRAND.highlightBorder};border-radius:12px;">
      <tr>
        <td>
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.greenMuted};">
            Or copy this link
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;word-break:break-all;color:${BRAND.textMuted};">
            <a href="${safeUrl}" style="color:${BRAND.greenLight};text-decoration:none;">${safeUrl}</a>
          </p>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:24px;border-top:1px solid ${BRAND.border};">
      <tr>
        <td>
          ${emailMuted('This link expires in 1 hour. If you did not request a reset, you can safely ignore this email.')}
        </td>
      </tr>
    </table>`

  return wrapEmailLayout({
    preheader: 'Reset your A-DNA Member Portal password',
    title: PASSWORD_RESET_EMAIL_SUBJECT,
    bodyHtml,
    siteUrl,
  })
}

export function buildPasswordResetEmailText({
  firstName,
  resetUrl,
  siteUrl,
}: PasswordResetEmailData) {
  return [
    `Hello ${firstName},`,
    '',
    'We received a request to set or reset your A-DNA Member Portal password.',
    '',
    `Reset your password: ${resetUrl}`,
    '',
    'This link expires in 1 hour. If you did not request a reset, you can ignore this email.',
    '',
    siteUrl,
  ].join('\n')
}
