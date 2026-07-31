/** Public asset used on white-background documents and print templates. */
export const ADNA_LOGO_FILENAME = 'New adna logo.jpeg'

export function adnaLogoUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/$/, '')
  return `${normalized}/${encodeURIComponent(ADNA_LOGO_FILENAME)}`
}
