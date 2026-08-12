import { useState, type ReactNode } from 'react'
import { SocialLinks } from './SocialLinks'
import { ContactDrawerContext } from './contactDrawerContext'

export function ContactDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  // Keeps the overlay mounted during the slide-down animation
  const [overlayVisible, setOverlayVisible] = useState(false)

  const open = () => {
    setOverlayVisible(true)
    requestAnimationFrame(() => setIsOpen(true))
  }
  const close = () => {
    setIsOpen(false)
    setTimeout(() => setOverlayVisible(false), 400)
  }

  return (
    <ContactDrawerContext.Provider value={{ open }}>
      {children}

      {overlayVisible && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 199 }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: '#52b788',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.38s cubic-bezier(0.32,0.72,0,1)',
          borderRadius: '1.5rem 1.5rem 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          padding: '2rem 2rem 3rem',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <h3
              className="font-heading"
              style={{
                fontWeight: 900,
                fontSize: '1.375rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#0d2818',
                margin: 0,
              }}
            >
              Contact Us
            </h3>
            <button
              onClick={close}
              aria-label="Close"
              style={{
                background: 'rgba(0,0,0,0.12)',
                border: 'none',
                cursor: 'pointer',
                color: '#0d2818',
                borderRadius: '50%',
                width: '2.25rem',
                height: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <a
              href="mailto:info@a-dna.org"
              className="hover:opacity-70"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#0d2818',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                marginBottom: '0.75rem',
              }}
            >
              <MailIcon />
              info@a-dna.org
            </a>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <DrawerPhone href="tel:+13019650081" label="US: +1 301 965 0081" />
              <DrawerPhone href="tel:+447423618694" label="UK: +44 7423 618694" />
              <DrawerPhone href="tel:+233539824538" label="Ghana: +233 53 982 4538" />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.75rem',
              color: '#0d2818',
              fontSize: '0.9rem',
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            <svg
              style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: 2 }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>6655 Santa Barbara Rd 8004, Elkridge MD 21075, United States</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'rgba(13,40,24,0.6)',
                fontWeight: 700,
                margin: '0 0 0.875rem',
              }}
            >
              Follow Us
            </p>
            <SocialLinks
              iconClassName="hover:opacity-60"
              iconStyle={{ width: '1.6rem', height: '1.6rem', color: '#0d2818' }}
              gap="1.25rem"
            />
          </div>
        </div>
      </div>
    </ContactDrawerContext.Provider>
  )
}

export function MailIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style ?? { width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  )
}

export function PhoneIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style ?? { width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  )
}

function DrawerPhone({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="hover:opacity-70"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#0d2818',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '1rem',
        minWidth: 180,
      }}
    >
      <PhoneIcon />
      {label}
    </a>
  )
}
