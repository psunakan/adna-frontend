import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

export function RegistrationModal({ open, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

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
          minHeight: '90vh',
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          margin: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
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
        <iframe
          src="https://campaign.g-dna.org/register"
          title="Event registration"
          width="100%"
          style={{ border: 'none', display: 'block', height: '100vh', minHeight: 600 }}
          frameBorder={0}
          allow="payment"
        />
      </div>
    </div>
  )
}
