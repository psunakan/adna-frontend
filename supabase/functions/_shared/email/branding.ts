/** A-DNA brand tokens for transactional email HTML (inline styles only). */
export const BRAND = {
  green: '#0D3D2B',
  greenLight: '#116b53',
  red: '#cc0000',
  text: '#1f2937',
  textMuted: '#64748b',
  surface: '#f9fafb',
  highlightBg: '#f0faf6',
  white: '#ffffff',
  fontFamily: "'Source Sans 3', Arial, Helvetica, sans-serif",
  headingFont: "'Plus Jakarta Sans', 'Source Sans 3', Arial, Helvetica, sans-serif",
} as const

export const CONTACT_EMAIL = 'info@a-dna.org'

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
