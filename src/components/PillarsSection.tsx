import { useState } from 'react'
import { PILLARS } from '../data/pillars'
import { Reveal } from './Reveal'

export function PillarsSection() {
  const [active, setActive] = useState(1)
  const pillar = PILLARS.find((p) => p.id === active) ?? PILLARS[0]

  return (
    <section id="pillars-section" className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-8 overflow-visible">
          <h3
            className="font-heading text-pcna-green text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-normal sm:tracking-wide lg:tracking-widest uppercase mb-4 overflow-visible break-words leading-tight"
            style={{ color: '#0a3d2e' }}
          >
            Five Pillars for Strengthening Nursing &amp; Midwifery in Africa
          </h3>
          <div className="w-16 h-1 bg-pcna-red mx-auto rounded-full" />
        </Reveal>

        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {PILLARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`ptab group ${active === p.id ? 'ptab-active' : ''}`}
                  data-pillar={p.id}
                  onClick={() => setActive(p.id)}
                  onMouseEnter={() => setActive(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '20px 24px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: active === p.id ? '6px solid #116b53' : '6px solid transparent',
                    borderRadius: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  <span
                    className="ptab-num"
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: active === p.id ? '#116b53' : '#e2e8f0',
                      color: active === p.id ? '#fff' : '#64748b',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {p.id}
                  </span>
                  <span
                    className="ptab-title"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: active === p.id ? '#116b53' : '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {p.shortTitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-6">
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 340,
                overflow: 'hidden',
                borderRadius: 16,
                boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={pillar.banner}
                alt="A-DNA Pillars"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to right,rgba(17,107,83,0.9) 0%,rgba(17,107,83,0.3) 60%,transparent 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '0 40px',
                }}
              >
                <h2
                  className="font-heading"
                  style={{
                    fontWeight: 900,
                    fontSize: '2.2rem',
                    color: '#fff',
                    textTransform: 'uppercase',
                    margin: '0 0 10px',
                    lineHeight: 1.1,
                  }}
                >
                  {pillar.title}
                </h2>
              </div>
            </div>

            <div
              key={active}
              className="pillar-panel-fade"
              style={{ display: 'flex', flexDirection: 'column', gap: 30 }}
            >
              <div
                style={{
                  background: '#f4f6f8',
                  borderLeft: '6px solid #116b53',
                  padding: '25px 30px',
                  borderRadius: '0 16px 16px 0',
                }}
              >
                <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pillar.imgs.map((name) => (
                  <div key={name} className="gallery-img-wrap group">
                    <img
                      src={`/Pictures/${name}`}
                      alt={pillar.title}
                      className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
