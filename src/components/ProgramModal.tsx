import { useEffect, useState } from 'react'
import { adnaLogoUrl } from '../lib/branding'
import {
  PROGRAM_DAYS,
  PROGRAM_EYEBROW,
  PROGRAM_LOCATION,
  PROGRAM_SUBTITLE,
  PROGRAM_TITLE,
  type ProgramSession,
} from '../data/programAgenda'

type Props = {
  open: boolean
  onClose: () => void
}

const FORMAT_VARIANT: Record<string, 'active' | 'free' | 'pending'> = {
  Keynote: 'active',
  Panel: 'free',
  Breakout: 'pending',
}

function formatBadgeClass(format: string): string {
  const variant = FORMAT_VARIANT[format]
  return variant
    ? `portal-status portal-status--${variant}`
    : 'portal-status portal-status--neutral'
}

// Renders one agenda line verbatim from the source doc. Lines starting with an
// em dash are panelist entries; a leading track letter (e.g. "A   Advancing...")
// or a "Label  Value" double-space split (e.g. "Host  Redeemers Church of
// Christ") gets its label bolded for readability — the wording itself is untouched.
function SessionDetailLine({ line }: { line: string }) {
  if (line.startsWith('— ')) {
    return <p className="program-session__panelist">{line}</p>
  }

  const trackMatch = line.match(/^([A-Z]) {2,}(.+)$/)
  if (trackMatch) {
    return (
      <p className="program-session__line">
        <strong>{trackMatch[1]}</strong> {trackMatch[2]}
      </p>
    )
  }

  const labelMatch = line.match(/^([A-Za-z][A-Za-z ]{2,30}?) {2}(.+)$/)
  if (labelMatch) {
    return (
      <p className="program-session__line">
        <strong>{labelMatch[1]}</strong> {labelMatch[2]}
      </p>
    )
  }

  return <p className="program-session__line">{line}</p>
}

function SessionCard({ session }: { session: ProgramSession }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = (session.details?.length ?? 0) > 0

  return (
    <div className="program-session">
      <button
        type="button"
        className="program-session__header"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        aria-expanded={hasDetails ? expanded : undefined}
        disabled={!hasDetails}
      >
        <span className="program-session__time">{session.time}</span>
        <span className="program-session__title">
          {session.title}
          {session.sponsor && (
            <span className="program-session__sponsor"> · {session.sponsor}</span>
          )}
        </span>
        <span className={formatBadgeClass(session.format)}>{session.format}</span>
        {hasDetails && (
          <span
            className={`program-session__chevron${expanded ? ' program-session__chevron--open' : ''}`}
            aria-hidden="true"
          >
            &#9662;
          </span>
        )}
      </button>
      {hasDetails && expanded && (
        <div className="program-session__details">
          {session.details!.map((line) => (
            <SessionDetailLine key={line} line={line} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProgramModal({ open, onClose }: Props) {
  const [activeDayId, setActiveDayId] = useState(PROGRAM_DAYS[0].id)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const activeDay = PROGRAM_DAYS.find((day) => day.id === activeDayId) ?? PROGRAM_DAYS[0]
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
        zIndex: 9999,
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            fontSize: '1.5rem',
            background: '#0D3D2B',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            zIndex: 10000,
            color: '#fff',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &#10005;
        </button>

        <div className="program-modal__body">
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

          <div className="program-modal__tabs" role="tablist">
            {PROGRAM_DAYS.map((day) => (
              <button
                key={day.id}
                type="button"
                role="tab"
                aria-selected={day.id === activeDayId}
                className={`program-modal__tab${day.id === activeDayId ? ' program-modal__tab--active' : ''}`}
                onClick={() => setActiveDayId(day.id)}
              >
                {day.label}
                <span className="program-modal__tab-date">{day.dateLabel}</span>
              </button>
            ))}
          </div>

          <div className="program-modal__sessions">
            {activeDay.sessions.map((session) => (
              <SessionCard
                key={`${activeDay.id}-${session.time}-${session.title}`}
                session={session}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
