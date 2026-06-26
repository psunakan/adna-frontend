import { BRAND, escapeHtml } from './branding.ts'

export type EmailLayoutOptions = {
  preheader: string
  title: string
  bodyHtml: string
  siteUrl: string
}

export function wrapEmailLayout({ preheader, title, bodyHtml, siteUrl }: EmailLayoutOptions) {
  const safeTitle = escapeHtml(title)
  const safeSite = escapeHtml(siteUrl)
  const logoUrl = `${siteUrl}/logo-transparent.png`

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
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:${BRAND.fontFamily};color:${BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.surface};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:${BRAND.green};padding:28px 32px;border-bottom:4px solid ${BRAND.red};text-align:center;">
              <img src="${logoUrl}" alt="A-DNA" width="120" height="auto" style="display:block;margin:0 auto 12px;max-width:120px;height:auto;border:0;" />
              <p style="margin:0;font-family:${BRAND.headingFont};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.white};">
                African-Diaspora Nursing Alliance
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background-color:${BRAND.surface};border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
                &copy; ${new Date().getFullYear()} African-Diaspora Nursing Alliance (A-DNA)
              </p>
              <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.6;">
                <a href="${safeSite}" style="color:${BRAND.green};text-decoration:none;font-weight:600;">${safeSite.replace(/^https?:\/\//, '')}</a>
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

export function emailButton(
  href: string,
  label: string,
  variant: 'primary' | 'secondary' = 'primary',
) {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  const isPrimary = variant === 'primary'

  return `<a href="${safeHref}" style="display:inline-block;margin:4px 8px 4px 0;padding:14px 28px;border-radius:8px;font-family:${BRAND.fontFamily};font-size:15px;font-weight:700;text-decoration:none;${
    isPrimary
      ? `background-color:${BRAND.green};color:${BRAND.white};`
      : `background-color:${BRAND.white};color:${BRAND.green};border:2px solid ${BRAND.green};`
  }">${safeLabel}</a>`
}
