import { escapeHtml } from './branding.ts'
import { emailButton, wrapEmailLayout } from './baseLayout.ts'

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

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0D3D2B;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
      Hello ${safeName},
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#374151;">
      We received a request to set or reset your A-DNA Member Portal password. Use the button below to choose a password.
    </p>
    <p style="margin:0 0 24px;">
      ${emailButton(resetUrl, 'Reset password')}
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
      Or copy this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;word-break:break-all;color:#64748b;">
      ${escapeHtml(resetUrl)}
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
      This link expires in 1 hour. If you did not request a reset, you can ignore this email.
    </p>
  `

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
