import { Link } from '@tanstack/react-router'
import { CollaboratorsMarquee } from '../components/CollaboratorsMarquee'
import { Reveal, StatCounter } from '../components/Reveal'

export function HomePage() {
  return (
    <section id="home" className="animate-fade-in">
      <div className="hero-bg flex items-start min-h-[95vh]">
        <div
          className="w-full relative z-10 px-4 sm:px-6 lg:px-8"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
            paddingTop: '2rem',
            paddingBottom: '5rem',
          }}
        >
          <div className="text-white hero-text-shadow text-center max-w-5xl mx-auto">
            <h1
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3"
              style={{ fontWeight: 900 }}
            >
              Advancing Global Health
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 font-bold leading-relaxed max-w-2xl mx-auto">
              Join a global network of nursing and midwifery professionals dedicated to capacity
              building, clinical excellence, and leadership across the African diaspora and the
              continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-3 bg-pcna-red text-white font-bold rounded-md hover:bg-red-800 transition-all duration-300 hover:scale-105 shadow-md uppercase tracking-wider text-sm text-center"
              >
                Join A-DNA Today
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3 bg-white text-pcna-green font-bold rounded-md hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-md uppercase tracking-wider text-sm text-center"
              >
                View Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-5"
              style={{ color: '#0a3d2e' }}
            >
              Empowering the African Diaspora Nursing and Midwifery Community
            </h2>
            <div
              className="mx-auto mb-5"
              style={{ width: 80, height: 5, background: '#c0392b', borderRadius: 2 }}
            />
            <p
              className="text-base sm:text-lg md:text-xl mx-auto leading-relaxed"
              style={{ fontWeight: 700, color: '#222', maxWidth: 540 }}
            >
              The African-Diaspora Nursing Alliance (A-DNA) is a non-profit organization dedicated
              to linking and advancing African nurses and midwives globally, driving meaningful
              progress in health outcomes worldwide.
            </p>
          </div>

          <div className="w-full overflow-hidden" style={{ height: 40, margin: '1rem 0' }}>
            <svg
              viewBox="0 0 1200 40"
              preserveAspectRatio="none"
              style={{ width: '100%', height: 40 }}
            >
              <path
                d="M0,20 C200,40 400,0 600,20 C800,40 1000,0 1200,20 L1200,40 L0,40 Z"
                fill="#c0392b"
                opacity="0.12"
              />
              <path
                d="M0,20 C200,40 400,0 600,20 C800,40 1000,0 1200,20"
                fill="none"
                stroke="#c0392b"
                strokeWidth="2.5"
                opacity="0.75"
              />
            </svg>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch mt-2">
            <div className="lg:w-1/2">
              <img
                src="/Pictures/Homepage3.jpeg"
                alt="A-DNA Nurses and Midwives"
                className="rounded-xl shadow-lg w-full h-full object-cover"
              />
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center" style={{ padding: '3rem 2rem' }}>
              <h3
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-black mb-4"
                style={{ color: '#0a3d2e', fontWeight: 900 }}
              >
                Linking and Advancing African Nurses and Midwives Globally
              </h3>
              <p
                className="text-base sm:text-lg md:text-xl leading-relaxed mb-6"
                style={{ fontWeight: 600, color: '#444' }}
              >
                A-DNA was founded to create a strong, sustainable connection between African and
                Diasporan nurses and midwives, focused on education, empowerment, and innovation in
                healthcare delivery across the continent and beyond.
              </p>
              <Link
                to="/about"
                className="inline-block px-8 py-3 rounded-md font-heading uppercase tracking-wider transition-all duration-300 hover:bg-[#0a3d2e] hover:text-white"
                style={{ border: '2px solid #0a3d2e', color: '#0a3d2e', fontWeight: 900 }}
              >
                Explore Our Mission &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div id="stats-bar" className="bg-white border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <Reveal className="py-10 px-6 text-center">
              <StatCounter
                target={6500}
                suffix="+"
                className="text-5xl md:text-6xl font-extrabold font-heading text-pcna-green"
              />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
                Members &amp; Counting
              </div>
            </Reveal>
            <Reveal delay={1} className="py-10 px-6 text-center">
              <StatCounter
                target={19}
                className="text-5xl md:text-6xl font-extrabold font-heading text-pcna-red"
              />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
                Expert Leaders
              </div>
            </Reveal>
            <Reveal delay={2} className="py-10 px-6 text-center">
              <StatCounter
                target={3}
                suffix="+"
                className="text-5xl md:text-6xl font-extrabold font-heading text-pcna-teal"
              />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
                Years of Impact
              </div>
            </Reveal>
            <Reveal delay={3} className="py-10 px-6 text-center">
              <StatCounter
                target={5}
                className="text-5xl md:text-6xl font-extrabold font-heading text-pcna-green"
              />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-3">
                Core Strategies
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="py-10" style={{ background: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {[
              {
                img: '/Pictures/Homepage1.jpeg',
                title: 'Global Connectivity',
                text: 'We connect African nurses and midwives across the diaspora, building a professional network that transcends borders. Through knowledge sharing, mentorship, and collaborative advocacy, we amplify African nursing voices on a truly international scale.',
              },
              {
                img: '/Pictures/Homepage4.jpeg',
                title: 'Advancement of Nurses and Midwives',
                text: 'We champion the professional growth of African nurses and midwives, addressing a critical gap in the face of a global nursing shortage and the longstanding underrepresentation of African perspectives in healthcare leadership.',
              },
              {
                img: '/Pictures/Communtyimpact.jpeg',
                title: 'Global Health Impact',
                text: "By elevating African nurses and midwives, A-DNA strengthens the communities that need it most. We believe that when African nurses and midwives thrive, the world's most underserved populations receive the quality care they deserve.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col p-8 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ background: 'white', border: '1px solid #e0e0e0' }}
              >
                <img
                  src={card.img}
                  className="w-full object-cover rounded-lg mb-4"
                  alt={card.title}
                  style={{ maxHeight: 220, objectPosition: 'top center' }}
                />
                <h3
                  className="font-heading text-xl mb-3"
                  style={{ fontWeight: 900, color: '#116b53' }}
                >
                  {card.title}
                </h3>
                <p style={{ fontWeight: 600, color: '#444' }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="text-white mb-20 md:mb-12 relative overflow-hidden"
        style={{
          backgroundImage: "url('/Pictures/JointheAlliance.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          backgroundRepeat: 'no-repeat',
          minHeight: 500,
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(13, 61, 43, 0.75)' }} />
        <div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            minHeight: 500,
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-4">
              Join the Alliance
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Be part of a transformative movement in global health. Connect with experts, access
              exclusive benefits, and help shape the future of nursing.
            </p>
          </div>
          <Link
            to="/membership"
            className="px-10 py-4 bg-white text-pcna-green font-bold rounded-md hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl uppercase tracking-widest text-sm"
          >
            Join Now
          </Link>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-pcna-green uppercase tracking-tight">
                Latest News &amp; Updates
              </h2>
              <div className="w-16 h-1 bg-pcna-red mt-2" />
            </div>
            <Link
              to="/events"
              className="text-pcna-red font-bold text-sm uppercase hover:underline"
            >
              All News &rarr;
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col border-l-4 border-pcna-green bg-pcna-light rounded-r overflow-hidden">
              <img
                src="/Pictures/lastestnew52126.jpeg"
                alt="A-DNA Advocates on Capitol Hill"
                className="w-full object-cover"
                style={{ height: 280, objectPosition: 'center 20%' }}
              />
              <div className="p-4 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  May 2026 &middot; Advocacy
                </span>
                <h4 className="font-bold text-pcna-green hover:text-pcna-red cursor-pointer transition-colors">
                  A-DNA Advocates on Capitol Hill
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Healthcare professionals continue to show up, serve, advocate, and save lives even
                  in the most challenging conditions. A-DNA was proud to join FIGS and healthcare
                  advocates in amplifying conversations around fair pay, safer workplaces, mental
                  health support for healthcare workers, and stronger protections for those who care
                  for others every day.
                </p>
                <p className="text-xs text-pcna-green font-semibold">
                  #HealthcareIsHuman #CapitolHill #HealthcareAdvocacy
                </p>
                <a
                  href="https://www.linkedin.com/posts/healthcareishuman-capitolhill-healthcareadvocacy-ugcPost-7463433674257186817-qMkL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pcna-red font-bold text-sm uppercase hover:underline mt-1"
                >
                  Read on LinkedIn &rarr;
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-8">
              {[
                {
                  day: '21',
                  month: 'AUG',
                  borderClass: 'border-pcna-green',
                  dayClass: 'text-pcna-green',
                  title: 'G-DNA Global Conference USA: Voices of Change',
                  desc: 'Translating Innovation into Action for Global Health at Johns Hopkins Medical Campus, Baltimore.',
                },
                {
                  day: '07',
                  month: 'JAN',
                  borderClass: 'border-pcna-red',
                  dayClass: 'text-pcna-red',
                  title: 'G-DNA Global Health Conference: Accra 2027',
                  desc: 'Save the date for our transformative summit in Accra, Ghana, connecting nurses worldwide.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`flex gap-4 p-4 border-l-4 ${item.borderClass} bg-pcna-light rounded-r`}
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className={`block text-2xl font-bold ${item.dayClass}`}>{item.day}</span>
                    <span className="block text-xs uppercase font-bold text-gray-500">
                      {item.month}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-pcna-green hover:text-pcna-red cursor-pointer transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CollaboratorsMarquee />
    </section>
  )
}
