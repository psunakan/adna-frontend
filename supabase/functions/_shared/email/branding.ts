/** A-DNA brand tokens for transactional email HTML (inline styles only). */
export const BRAND = {
  green: '#0D3D2B',
  greenLight: '#116b53',
  greenMuted: '#2d6b54',
  red: '#CE1126',
  gold: '#FCD116',
  text: '#1a2e28',
  textMuted: '#5c6f68',
  surface: '#eef4f1',
  highlightBg: '#f3faf7',
  highlightBorder: '#c8e6d9',
  white: '#ffffff',
  border: '#dfe9e4',
  fontFamily: "'Source Sans 3', Arial, Helvetica, sans-serif",
  headingFont: "'Plus Jakarta Sans', 'Source Sans 3', Arial, Helvetica, sans-serif",
} as const

export const CONTACT_EMAIL = 'info@a-dna.org'
export const ORG_NAME = 'African-Diaspora Nursing Alliance'
export const ORG_SHORT = 'A-DNA'

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
