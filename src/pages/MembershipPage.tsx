import { MembershipForm } from '../components/MembershipForm'

const REASONS = [
  {
    num: '01',
    title: 'Networking & Job Opportunities',
    text: 'Be part of a thriving global community of professionals, students, and retirees. Gain access to exclusive opportunities designed to help you grow your network and advance your career, wherever you are in the world.',
  },
  {
    num: '02',
    title: 'Preceptorship & Scholarship',
    text: 'Empowering the next generation through education, mentorship, and real-world exposure. Our Preceptorship and Scholarship programs support students and young professionals in achieving academic and career excellence.',
  },
  {
    num: '03',
    title: 'Professional Advice & Wellness Support',
    text: 'True success goes beyond career achievements; it includes personal growth, emotional balance, and overall well-being. We offer support systems that address both your professional journey and your wellness needs.',
  },
  {
    num: '04',
    title: 'Educational Materials & Event Discounts',
    text: 'Access exclusive resources and opportunities designed to support your continuous learning and active participation in the community.',
  },
]

function scrollToForm() {
  const el = document.getElementById('membership-form')
  if (!el) return
  const offset = el.getBoundingClientRect().top + window.pageYOffset - 80
  window.scrollTo({ top: offset, behavior: 'smooth' })
}

export function MembershipPage() {
  return (
    <section id="membership" className="animate-fade-in">
      <div className="mem-pad" style={{ background: '#0D3D2B' }}>
        <div className="mem-inner">
          <div className="mem-hero-cols">
            <div className="mem-hero-content">
              <h2
                className="font-heading"
                style={{
                  fontSize: 'clamp(2.4rem,5vw,4rem)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  color: '#fff',
                  lineHeight: 1.05,
                  margin: '0 0 1.5rem',
                }}
              >
                Become a<br />
                <em style={{ fontWeight: 800, fontStyle: 'italic', color: '#9FE1CB' }}>Member</em>
                <br />
                Today
              </h2>
              <p
                style={{
                  fontWeight: 300,
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  lineHeight: 1.75,
                  maxWidth: 540,
                  margin: '0 0 1.75rem',
                }}
              >
                Join a vibrant community of professionals and changemakers committed to growth,
                collaboration, and impact. Gain access to exclusive opportunities and a network that
                supports your personal and collective development.
              </p>
              <button type="button" className="mem-hero-btn" onClick={scrollToForm}>
                Register Now
              </button>
            </div>
            <div className="mem-hero-media">
              <img
                src="/Pictures/JointheAlliance.jpeg"
                alt="A-DNA members and community"
                className="mem-hero-image"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mem-pad" style={{ background: '#f5f5f3', paddingTop: '2rem' }}>
        <div className="mem-inner">
          <div style={{ marginBottom: '3rem' }}>
            <h2
              className="font-heading font-black tracking-widest uppercase text-4xl sm:text-5xl md:text-6xl"
              style={{ color: '#0a3d2e' }}
            >
              Choose Your Path
            </h2>
            <div className="w-16 h-1 bg-pcna-red mx-auto rounded-full mt-4 mb-10" />
          </div>

          <div className="mem-tiers-grid">
            <div
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                padding: '2.5rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: '#5DCAA5',
                  margin: '0 0 1.25rem',
                }}
              >
                Diaspora · $75/yr &nbsp;|&nbsp; Ghana · 300 GHS
              </p>
              <h3
                className="font-heading font-black uppercase tracking-wide"
                style={{ color: '#0D3D2B', margin: '0 0 0.5rem' }}
              >
                Professional
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.35rem',
                  margin: '0.75rem 0 1.75rem',
                }}
              >
                <span
                  style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0D3D2B', lineHeight: 1 }}
                >
                  $75
                </span>
                <span style={{ fontWeight: 400, color: '#334155', fontSize: '1.05rem' }}>
                  /year
                </span>
              </div>
              <ul className="mem-feat">
                <li>Support for capacity strengthening efforts</li>
                <li>Advance professional career through educational offerings (CPD eligible)</li>
                <li>Expedite Ghana nursing licence application</li>
                <li>Expand professional network</li>
                <li>Support medical outreach projects</li>
              </ul>
              <button
                type="button"
                className="mem-tier-btn mem-tier-btn--dark"
                onClick={scrollToForm}
              >
                Register
              </button>
            </div>

            <div
              style={{
                background: '#0D3D2B',
                border: '1px solid #0D3D2B',
                padding: '2.5rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: '#5DCAA5',
                  margin: '0 0 1.25rem',
                }}
              >
                Diaspora · $150/yr &nbsp;|&nbsp; Ghana · 600 GHS
              </p>
              <h3
                className="font-heading font-black uppercase tracking-wide"
                style={{ color: '#fff', margin: '0 0 0.5rem' }}
              >
                Premium
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.35rem',
                  margin: '0.75rem 0 1.75rem',
                }}
              >
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  $150
                </span>
                <span style={{ fontWeight: 300, color: '#ffffff', fontSize: '0.95rem' }}>
                  /year
                </span>
              </div>
              <ul className="mem-feat mem-feat--dark">
                <li>Support for capacity strengthening efforts</li>
                <li>Advance professional career through educational offerings (CPD eligible)</li>
                <li>Expedite Ghana nursing licence application</li>
                <li>Expand professional network</li>
                <li>Support medical outreach projects</li>
                <li>Free Advance Practice Preceptorship opportunities</li>
                <li>Access to Bentil Leadership Institute</li>
                <li>Mentorship Program (Enhanced access)</li>
                <li>Conference discount</li>
                <li>Walden University Tuition benefit</li>
              </ul>
              <button
                type="button"
                className="mem-tier-btn mem-tier-btn--mint"
                onClick={scrollToForm}
              >
                Register
              </button>
            </div>
          </div>

          <p
            style={{
              fontSize: '1.05rem',
              fontWeight: 400,
              color: '#334155',
              marginTop: '1.5rem',
              lineHeight: 1.8,
            }}
          >
            Professional Membership: <strong style={{ fontWeight: 600 }}>$75/year</strong> for
            Diaspora members; 300 GHS for members in Ghana/Africa
            <br />
            Premium Membership: <strong style={{ fontWeight: 600 }}>$150/year</strong> for Diaspora
            members; <strong style={{ fontWeight: 600 }}>600 GHS</strong> for members in Ghana
          </p>
        </div>
      </div>

      <div className="mem-pad" style={{ background: '#fff', paddingTop: '2rem' }}>
        <div className="mem-inner">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              className="font-heading font-black tracking-widest uppercase text-4xl sm:text-5xl md:text-6xl"
              style={{ color: '#0a3d2e' }}
            >
              Why You Should Join Us
            </h2>
            <div className="w-16 h-1 bg-pcna-red mx-auto rounded-full mt-4 mb-6" />
          </div>
          <div className="mem-reasons-grid">
            {REASONS.map((r) => (
              <div key={r.num} className="mem-reason-card">
                <span
                  style={{
                    display: 'block',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#a80000',
                    lineHeight: 1,
                    marginBottom: '0.75rem',
                  }}
                >
                  {r.num}
                </span>
                <h4
                  className="font-heading text-xl"
                  style={{
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#116b53',
                    margin: '0 0 0.75rem',
                  }}
                >
                  {r.title}
                </h4>
                <p
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 400,
                    color: '#334155',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MembershipForm />
    </section>
  )
}
