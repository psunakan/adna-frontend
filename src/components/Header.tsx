import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MailIcon, PhoneIcon } from './ContactDrawer'
import { useContactDrawer } from './contactDrawerContext'
import { MemberProfileButton } from './MemberProfileButton'
import { useMemberAuth } from '../lib/memberAuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/events', label: 'Events' },
  { to: '/membership', label: 'Membership' },
] as const

export function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = () => {
    clearTimeout(hideTimer.current)
    setDropdownOpen(true)
  }
  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setDropdownOpen(false), 250)
  }

  return (
    <div className="bg-pcna-green text-white text-sm py-2 block relative z-[99999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end items-center space-x-6">
        <MemberProfileButton variant="light" size="sm" />
        <div className="relative" onMouseEnter={show} onMouseLeave={scheduleHide}>
          <button className="flex items-center gap-1 hover:underline bg-transparent border-0 text-white text-sm font-sans cursor-pointer p-0">
            Contact Us
            <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              onMouseEnter={show}
              onMouseLeave={scheduleHide}
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                paddingTop: 6,
                width: 230,
                zIndex: 9999999,
              }}
            >
              <div
                style={{
                  background: 'white',
                  color: '#1f2937',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid #f3f4f6',
                }}
              >
                <a
                  href="mailto:info@a-dna.org"
                  className="text-pcna-green hover:text-pcna-red"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    marginBottom: '0.875rem',
                  }}
                >
                  <MailIcon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                  info@a-dna.org
                </a>
                <a
                  href="tel:+13019650081"
                  className="text-pcna-green hover:text-pcna-red"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <PhoneIcon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                  +1 301-965-0081
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { open: openContactDrawer } = useContactDrawer()
  const { isAuthenticated, profile } = useMemberAuth()

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeAnd = (fn?: () => void) => () => {
    setMobileOpen(false)
    fn?.()
  }

  return (
    <>
      <nav
        className="bg-white shadow-md sticky top-0 z-[9999]"
        style={{ backgroundColor: '#ffffff', position: 'relative', top: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex justify-between items-center"
            style={{ minHeight: 'fit-content', paddingTop: 8, paddingBottom: 8 }}
          >
            <Link to="/" className="flex-shrink-0 cursor-pointer">
              <img
                src="/Pictures/New adna logo.png"
                alt="A-DNA Logo"
                className="h-20 w-auto"
                style={{ objectFit: 'contain', maxHeight: 80 }}
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-8 items-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.to === '/' }}
                  activeProps={{ className: 'nav-link-active' }}
                  className="text-pcna-green hover:text-pcna-red transition-colors font-extrabold text-xl uppercase tracking-wide py-4 border-b-4 border-transparent"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/donate"
                aria-label="Donate to A-DNA"
                className="ml-4 px-8 py-3 bg-pcna-red text-white font-extrabold rounded-md hover:bg-red-800 transition-all duration-300 hover:scale-105 shadow-lg uppercase tracking-widest text-xl"
              >
                Donate
              </Link>
              <MemberProfileButton variant="dark" className="ml-2" />
            </div>

            {/* Mobile: profile + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <MemberProfileButton variant="dark" size="sm" />
              <button
                className="lg:hidden p-2 text-pcna-green hover:text-pcna-red transition-colors rounded-md focus:outline-none"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999998 }}
        />
      )}

      {/* Mobile side panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '25vw',
          minWidth: 200,
          height: 'auto',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999,
          overflowY: 'auto',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          transform: mobileOpen ? 'translateX(0%)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 12px' }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '1.5rem',
                lineHeight: 1,
                padding: 4,
              }}
            >
              &#x2715;
            </button>
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeAnd()}
              className="mobile-nav-link hover:bg-[#f0faf6] hover:border-l-pcna-green"
              style={{
                display: 'block',
                padding: '11px 16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#116b53',
                textDecoration: 'none',
                borderLeft: '3px solid transparent',
                transition: 'background 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{ padding: '10px 16px' }}>
            <Link
              to="/donate"
              onClick={closeAnd()}
              style={{
                display: 'block',
                padding: '9px 12px',
                background: '#c0392b',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textAlign: 'center',
                borderRadius: 6,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Donate
            </Link>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 8 }}>
            {isAuthenticated && profile ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '8px 16px 12px',
                  borderLeft: '3px solid #0D3D2B',
                  background: '#f0faf6',
                }}
              >
                <MemberProfileButton variant="dark" size="sm" onNavigate={closeAnd()} />
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                  }}
                >
                  My Profile
                </span>
              </div>
            ) : (
              <Link
                to="/portal/login"
                onClick={closeAnd()}
                className="hover:text-[#c0392b]"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '9px 16px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#6b7280',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                Member Portal
              </Link>
            )}
            <button
              onClick={closeAnd(openContactDrawer)}
              className="hover:text-[#c0392b]"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '9px 16px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#6b7280',
                whiteSpace: 'nowrap',
              }}
            >
              Contact Us
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
