import { useEffect } from 'react'

export function DonatePage() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.zeffy.com/embed/v2/zeffy-embed.js'
    script.async = true
    script.onerror = () => {
      document.querySelectorAll('[data-zeffy-embed-fallback]').forEach((el) => {
        ;(el as HTMLElement).style.display = 'block'
      })
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <section id="donate" className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2
            className="font-heading text-4xl sm:text-5xl font-black uppercase tracking-widest"
            style={{ color: '#0a3d2e' }}
          >
            Support A-DNA
          </h2>
          <div className="w-16 h-1 bg-pcna-red mx-auto mt-4 rounded-full" />
          <p className="text-gray-600 mt-4 text-base font-bold">
            Your donation helps advance nursing excellence across the African diaspora.
          </p>
        </div>
        <div>
          <div
            data-zeffy-embed
            data-form-url="/embed/donation-form/your-support-matters-donate-to-a-good-cause"
          />
          <div data-zeffy-embed-fallback style={{ display: 'none' }}>
            <div style={{ position: 'relative', overflow: 'hidden', height: 450, width: '100%' }}>
              <iframe
                title="Donation form powered by Zeffy"
                style={{
                  position: 'absolute',
                  border: 0,
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                }}
                src="https://www.zeffy.com/embed/donation-form/your-support-matters-donate-to-a-good-cause"
                allow="payment"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
