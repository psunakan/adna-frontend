import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  images: string[]
}

export function GalleryModal({ open, onClose, title, images }: Props) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767.98px)').matches)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767.98px)')
    const handleChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!open) setLightboxSrc(null)
  }, [open])

  if (!open) return null

  const handleImageClick = (src: string) => {
    if (isMobile) setLightboxSrc(src)
  }

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
          padding: '2rem 1.5rem 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
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
        <h3 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-pcna-green mb-6">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt={title}
              onClick={() => handleImageClick(src)}
              className="w-full h-auto aspect-[3/4] object-contain rounded-lg shadow-md cursor-pointer md:aspect-auto md:object-cover md:cursor-default"
            />
          ))}
        </div>
      </div>
      {lightboxSrc && (
        <div
          role="presentation"
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.95)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={lightboxSrc}
            alt={title}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '90vh' }}
          />
        </div>
      )}
    </div>
  )
}
