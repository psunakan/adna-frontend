import { BRAND, ORG_NAME, adnaLogoUrl, escapeHtml } from './branding.ts'

export type EmailLayoutOptions = {
  preheader: string
  title: string
  bodyHtml: string
  siteUrl: string
}

export function wrapEmailLayout({ preheader, title, bodyHtml, siteUrl }: EmailLayoutOptions) {
  const safeTitle = escapeHtml(title)
  const safeSite = escapeHtml(siteUrl)
  const siteLabel = escapeHtml(siteUrl.replace(/^https?:\/\//, ''))
  const logoUrl = adnaLogoUrl(siteUrl)
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:${BRAND.fontFamily};color:${BRAND.text};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.surface};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;background-color:${BRAND.white};">
              <img src="${logoUrl}" alt="${escapeHtml(ORG_NAME)}" width="168" style="display:block;margin:0 auto;max-width:168px;width:168px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" height="4" style="background-color:${BRAND.red};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="34%" height="4" style="background-color:${BRAND.gold};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33%" height="4" style="background-color:${BRAND.green};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;background-color:${BRAND.highlightBg};border-top:1px solid ${BRAND.border};text-align:center;">
              <p style="margin:0 0 6px;font-family:${BRAND.headingFont};font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.green};">
                ${escapeHtml(ORG_NAME)}
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
                &copy; ${year} ${escapeHtml(ORG_NAME)}
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;">
                <a href="${safeSite}" style="color:${BRAND.greenLight};text-decoration:none;font-weight:600;">${siteLabel}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailHeading(text: string) {
  return `<h1 style="margin:0 0 12px;font-family:${BRAND.headingFont};font-size:28px;font-weight:800;color:${BRAND.green};line-height:1.25;letter-spacing:-0.02em;">${text}</h1>`
}

export function emailLead(text: string) {
  return `<p style="margin:0 0 28px;font-size:16px;line-height:1.75;color:${BRAND.textMuted};">${text}</p>`
}

export function emailParagraph(text: string, marginBottom = '20px') {
  return `<p style="margin:0 0 ${marginBottom};font-size:16px;line-height:1.75;color:${BRAND.text};">${text}</p>`
}

export function emailMuted(text: string) {
  return `<p style="margin:0;font-size:14px;line-height:1.65;color:${BRAND.textMuted};">${text}</p>`
}

export function emailHighlightCard(label: string, value: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr>
      <td style="background-color:${BRAND.highlightBg};border:1px solid ${BRAND.highlightBorder};border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.greenMuted};">
          ${label}
        </p>
        <p style="margin:0;font-family:${BRAND.headingFont};font-size:20px;font-weight:700;color:${BRAND.green};line-height:1.4;">
          ${value}
        </p>
      </td>
    </tr>
  </table>`
}

export function emailButtonStack(
  buttons: { href: string; label: string; variant?: 'primary' | 'secondary' }[],
) {
  return buttons
    .map(
      (btn, i) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${i === 0 ? '0' : '10px'} 0 0;">
    <tr>
      <td align="center">
        ${emailButton(btn.href, btn.label, btn.variant)}
      </td>
    </tr>
  </table>`,
    )
    .join('')
}

export function emailButton(
  href: string,
  label: string,
  variant: 'primary' | 'secondary' = 'primary',
) {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  const isPrimary = variant === 'primary'

  return `<a href="${safeHref}" style="display:block;width:100%;max-width:100%;box-sizing:border-box;padding:15px 24px;border-radius:10px;font-family:${BRAND.fontFamily};font-size:15px;font-weight:700;text-decoration:none;text-align:center;${
    isPrimary
      ? `background-color:${BRAND.green};color:${BRAND.white};`
      : `background-color:${BRAND.white};color:${BRAND.green};border:2px solid ${BRAND.green};`
  }">${safeLabel}</a>`
}
