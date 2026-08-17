import { useEffect, useRef, useState } from 'react'
import { adnaLogoUrl } from '../lib/branding'
import {
  PROGRAM_EYEBROW,
  PROGRAM_LOCATION,
  PROGRAM_SUBTITLE,
  PROGRAM_TITLE,
} from '../data/programAgenda'

type Props = {
  open: boolean
  onClose: () => void
}

const AGENDA_URL = 'https://a-dna.org/events/ADNA26Agenda'
const AGENDA_PDF_URL = '/agenda.pdf'

export function ProgramModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 639.98px)').matches)
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639.98px)')
    const handleChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current)
    }, [])

  if (!open) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(AGENDA_URL)
    } catch {
      return
    }
    setCopied(true)
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current)
    copyResetTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  const logoUrl = adnaLogoUrl(window.location.origin)

  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000000,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '1rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          margin: 'auto',
        }}
      >
        <div className="program-modal__body">
          <div
            className="flex flex-wrap items-center gap-2"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: '#fff',
              padding: isMobile ? '8px 12px' : '12px 16px',
              borderBottom: '1px solid #e8ecef',
              justifyContent: isMobile ? 'space-between' : 'flex-end',
            }}
          >
            {isMobile && (
              <img
                src={logoUrl}
                alt="African-Diaspora Nursing Alliance"
                style={{ height: 24, width: 'auto', flexShrink: 0 }}
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={AGENDA_PDF_URL}
                download
                className="sm:hidden inline-flex items-center"
                style={{
                  background: '#C0392B',
                  border: 'none',
                  borderRadius: 18,
                  height: 36,
                  padding: '0 12px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                📄 PDF
              </a>
              <a
                href={AGENDA_PDF_URL}
                download
                className="hidden sm:inline-flex items-center"
                style={{
                  background: '#C0392B',
                  border: 'none',
                  borderRadius: 18,
                  height: 36,
                  padding: '0 16px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                📄 Download PDF
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="sm:hidden inline-flex items-center"
                style={{
                  background: '#0D3D2B',
                  border: 'none',
                  borderRadius: 18,
                  height: 36,
                  padding: '0 12px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied' : '🔗 Link'}
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="hidden sm:inline-flex items-center"
                style={{
                  background: '#0D3D2B',
                  border: 'none',
                  borderRadius: 18,
                  height: 36,
                  padding: '0 16px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  fontSize: '1.5rem',
                  background: '#0D3D2B',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  color: '#fff',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                &#10005;
              </button>
            </div>
          </div>

          {!isMobile && (
            <header className="program-modal__hero">
              <div className="portal-hero__brand">
                <img
                  src={logoUrl}
                  alt="African-Diaspora Nursing Alliance"
                  className="portal-hero__logo"
                />
                <div className="portal-tricolor" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="program-modal__hero-body">
                <p className="portal-hero__eyebrow">{PROGRAM_EYEBROW}</p>
                <h2 className="program-modal__title font-heading">{PROGRAM_TITLE}</h2>
                <p className="portal-hero__subtitle">{PROGRAM_SUBTITLE}</p>
                <div className="portal-hero__badges">
                  <span className="portal-status portal-status--neutral">{PROGRAM_LOCATION}</span>
                </div>
              </div>
            </header>
          )}

          <div
            className="program-modal__pdf w-full"
            style={{
              height: isMobile ? 'calc(90vh - 60px)' : '75vh',
              minHeight: isMobile ? 320 : 400,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <iframe
              src={AGENDA_PDF_URL}
              title="ADNA26 Conference Agenda PDF"
              className="w-full"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
