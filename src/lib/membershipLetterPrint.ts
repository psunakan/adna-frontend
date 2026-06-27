import {
  buildVerificationUrl,
  formatVerificationDate,
  type MembershipVerification,
} from '../lib/membershipVerification'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildLetterHtml(
  verification: MembershipVerification,
  verifyUrl: string,
  origin: string,
): string {
  const issuedDate = formatVerificationDate(verification.issued_at)
  const code = escapeHtml(verification.verification_code)
  const name = escapeHtml(verification.member_display_name)
  const tier = escapeHtml(verification.membership_label)
  const year = verification.membership_year

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>A-DNA Membership Verification Letter</title>
  <style>
    @page { margin: 1in; }
    body {
      font-family: "Source Sans 3", Arial, sans-serif;
      color: #1f2937;
      line-height: 1.65;
      margin: 0;
      padding: 0;
    }
    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 24px 0;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid #0D3D2B;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    .header img {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }
    .org-name {
      font-family: "Plus Jakarta Sans", Arial, sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0D3D2B;
      margin: 0;
    }
    .org-sub {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    h1 {
      font-family: "Plus Jakarta Sans", Arial, sans-serif;
      font-size: 1.5rem;
      color: #0D3D2B;
      margin: 0 0 24px;
    }
    .body-copy {
      font-size: 1.05rem;
      margin: 0 0 18px;
    }
    .verification-box {
      border: 2px solid #0D3D2B;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 28px 0;
      background: #f0faf6;
    }
    .verification-box p {
      margin: 0 0 8px;
      font-size: 0.95rem;
    }
    .code {
      font-family: "Courier New", monospace;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #0D3D2B;
    }
    .verify-url {
      word-break: break-all;
      color: #116b53;
      font-size: 0.92rem;
    }
    .footer {
      margin-top: 36px;
      font-size: 0.9rem;
      color: #64748b;
    }
    .signature {
      margin-top: 40px;
      font-weight: 700;
      color: #0D3D2B;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="${escapeHtml(new URL('/logo.png', origin).href)}" alt="A-DNA logo" />
      <div>
        <p class="org-name">African-Diaspora Nursing Alliance</p>
        <p class="org-sub">Membership Verification Letter</p>
      </div>
    </div>

    <p class="body-copy">${issuedDate}</p>

    <h1>Membership Verification</h1>

    <p class="body-copy">
      To whom it may concern:
    </p>

    <p class="body-copy">
      This letter confirms that <strong>${name}</strong> is a member in good standing of the
      African-Diaspora Nursing Alliance (A-DNA) for calendar year <strong>${year}</strong> as a
      <strong>${tier}</strong> member.
    </p>

    <p class="body-copy">
      This document was issued through the official A-DNA member portal. Third parties may confirm
      authenticity using the verification code below on the A-DNA website. Codes are registered in
      A-DNA's membership database and cannot be validated unless issued by our system.
    </p>

    <div class="verification-box">
      <p><strong>Verification code</strong></p>
      <p class="code">${code}</p>
      <p style="margin-top: 14px;"><strong>Verify online</strong></p>
      <p class="verify-url">${escapeHtml(verifyUrl)}</p>
    </div>

    <p class="footer">
      If you have questions about this verification, contact A-DNA at info@a-dna.org.
    </p>

    <p class="signature">A-DNA Membership Services</p>
  </div>
</body>
</html>`
}

const LOADING_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>Preparing letter…</title></head>
<body style="font-family: Arial, sans-serif; padding: 2rem; color: #0D3D2B;">
  <p>Preparing your membership letter…</p>
</body>
</html>`

/** Open synchronously from a click handler — must not await before this call. */
export function openMembershipLetterPrintWindow(): Window | null {
  return window.open('about:blank', '_blank', 'width=900,height=1100')
}

export function showMembershipLetterLoading(printWindow: Window): void {
  printWindow.document.open()
  printWindow.document.write(LOADING_HTML)
  printWindow.document.close()
}

export function writeMembershipLetterPrint(
  printWindow: Window,
  verification: MembershipVerification,
  origin = window.location.origin,
): void {
  const verifyUrl = buildVerificationUrl(verification.verification_code)
  const html = buildLetterHtml(verification, verifyUrl, origin)

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()

  window.setTimeout(() => {
    printWindow.print()
  }, 300)
}

/** @deprecated Prefer openMembershipLetterPrintWindow + writeMembershipLetterPrint */
export function openMembershipLetterPrint(verification: MembershipVerification): boolean {
  const printWindow = openMembershipLetterPrintWindow()
  if (!printWindow) return false
  writeMembershipLetterPrint(printWindow, verification)
  return true
}
