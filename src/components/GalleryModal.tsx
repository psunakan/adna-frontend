import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  images: string[]
}

export function GalleryModal({ open, onClose, title, images }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) setLightboxSrc(null)
  }, [open])

  if (!open) return null

  const handleImageClick = (src: string) => {
    setLightboxSrc(src)
  }

  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="flex fixed inset-0 z-[9999] justify-center items-start px-1 py-2 sm:p-4 box-border overflow-y-auto bg-black/85"
    >
      <div
        className="relative w-full max-w-[900px] bg-white rounded-xl overflow-hidden mx-auto my-auto px-2 pt-6 pb-3 sm:p-6 sm:pt-8 box-border"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => handleImageClick(src)}
              className="block w-full p-0 border-0 bg-transparent overflow-hidden aspect-[3/4] rounded-lg shadow-md cursor-pointer md:aspect-auto"
            >
              <img
                src={src}
                alt={`${title} flyer ${index + 1}`}
                className="w-full h-full object-contain md:h-auto md:object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      {lightboxSrc && (
        <div
          role="presentation"
          onClick={() => setLightboxSrc(null)}
          className="flex fixed inset-0 z-[10001] items-center justify-center p-1 sm:p-4 box-border bg-black/95"
        >
          <img
            src={lightboxSrc}
            alt={`${title} flyer ${images.indexOf(lightboxSrc) + 1}`}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '90vh' }}
          />
        </div>
      )}
    </div>
  )
}
