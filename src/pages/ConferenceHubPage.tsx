import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Reveal } from '../components/Reveal'
import { useContactDrawer } from '../components/ContactDrawer'

// Native A-DNA Ghana 2027 Conference Hub (#ADNA27). Layout mirrors the former
// standalone hub; every image and video is served locally from /public/conference-hub
// and every link is internal (registration buttons go to the Accra 2027 card on the
// Events page, contact actions open the site's contact drawer).
const IMG = '/conference-hub'
const REGISTER_LINK = { to: '/events', hash: 'ghana-2027' } as const

// Opening of the conference: 7 Jan 2027, 08:00 in Accra (GMT, UTC+0).
const CONFERENCE_START = new Date('2027-01-07T08:00:00Z').getTime()

// Palette: site brand green/red plus the gold accent and deep "ink" used by the hub.
const INK = '#0a2a20'
const GOLD = '#d9a93f'

const STATS = [
  { value: '2.3x', label: 'growth from 432 delegates in 2026' },
  { value: '1,000+', label: 'Delegates expected' },
  { value: '6,500+', label: 'A-DNA members' },
  { value: '30+', label: 'Countries represented' },
]

const SUMMIT_WEEK = [
  {
    tag: 'Conference',
    accent: 'var(--color-pcna-green)',
    title: 'Three days of ideas into action',
    body: 'Meet your next collaborator. Connect with nurses, physicians, pharmacists, researchers, and health leaders from Africa and the Diaspora through plenaries, panels, and hands-on workshops.',
    date: '7 to 9 January 2027',
    place: 'University of Professional Studies, Accra (UPSA) · New Rd, Madina, Ghana',
  },
  {
    tag: 'Signature Gala',
    accent: GOLD,
    title: 'An evening to honour our own',
    body: 'Celebrate the professionals shaping African healthcare, make new connections, and share an evening of Ghanaian culture and community.',
    date: '9 January 2027',
    place: 'Accra, Ghana',
  },
  {
    tag: 'Community Health Fair',
    accent: 'var(--color-pcna-red)',
    title: 'Taking care where it is needed most',
    body: 'Free screening and education for underserved rural communities. Our 2026 fair served more than 1,000 people.',
    date: '12 and 13 January 2027',
    place: 'Northern Region, Ghana',
  },
]

// Order and spans match the original hub's dense mosaic.
const GALLERY: { src: string; alt: string; span?: 'col' | 'row' }[] = [
  {
    src: 'dsc03411.jpg',
    alt: 'A-DNA 2026 conference attendees posing together on the red carpet',
    span: 'col',
  },
  { src: 'dsc02848.jpg', alt: 'Smiling attendee in a pink blazer at the A-DNA 2026 conference' },
  {
    src: 'img_0232.jpg',
    alt: 'Traditional Ghanaian drummers in kente cloth performing at the conference',
  },
  {
    src: 'img_0278.jpg',
    alt: 'Keynote speaker at the podium during the A-DNA 2026 conference',
    span: 'row',
  },
  {
    src: 'dsc02866.jpg',
    alt: 'Packed audience of nurses and health professionals at the A-DNA 2026 conference',
    span: 'col',
  },
  { src: 'img_0250.jpg', alt: 'Attendees listening during a conference session' },
  {
    src: 'dsc03396.jpg',
    alt: 'Three attendees in vibrant African print at the A-DNA 2026 conference',
  },
  { src: 'img_0253.jpg', alt: 'Conference speaker applauding during a session', span: 'row' },
  {
    src: 'dsc05131.jpg',
    alt: 'Attendees collaborating at roundtables during a workshop',
    span: 'col',
  },
  {
    src: 'dsc03724.jpg',
    alt: 'Organiser speaking into a microphone at the A-DNA 2026 conference',
    span: 'row',
  },
  {
    src: 'dsc04801.jpg',
    alt: 'Hands-on team-building exercise at a conference workshop',
    span: 'col',
  },
  {
    src: 'dsc03418.jpg',
    alt: 'Speaker in traditional smock addressing the conference from the podium',
    span: 'row',
  },
  { src: 'dsc05120.jpg', alt: 'Facilitators leading a breast cancer awareness session' },
  { src: 'dsc04606.jpg', alt: 'Two attendees posing together at the conference', span: 'row' },
  {
    src: 'a5a0273.jpg',
    alt: 'Attendee in colourful African print arriving at the conference venue',
    span: 'row',
  },
  {
    src: 'a5a4919.jpg',
    alt: 'Gala guest in purple and silver traditional attire at the awards dinner',
    span: 'row',
  },
  { src: 'a5a5153.jpg', alt: 'Trailblazer award presentation on stage at the A-DNA gala' },
  { src: 'a5a5153-2.jpg', alt: 'Award recipient receiving a trophy at the A-DNA gala' },
  {
    src: 'a5a5533.jpg',
    alt: 'Nurse honoured with a DAISY Foundation award at the gala',
    span: 'row',
  },
  {
    src: 'dsc05628.jpg',
    alt: 'Smiling gala attendee in front of the sponsor backdrop',
    span: 'row',
  },
]

const TRACKS = [
  'Digital Health, AI & Diaspora-Led Innovation',
  'Infectious Disease',
  'Non-Communicable Diseases & Chronic Care',
  'Team-Based Care Models',
  'Policy, Advocacy & Systems Change',
  'Mental Health & Community Wellbeing',
  'Maternal & Child Health',
  'Workforce & Capacity Strengthening',
]

const FEATURED_PANELS = [
  {
    title: 'Re-imagining Health Professional Education with AI',
    body: 'Deans of medicine, nursing, and public health from Africa and the diaspora.',
  },
  {
    title: "Africa's True Gold: Our Health Workforce",
    body: 'From the Gold Coast to a global health force.',
  },
]

const REGISTRATION_TIERS = [
  {
    name: 'Diaspora Nurses, Midwives & Allied Health',
    price: 250,
    note: 'Conference registration',
    popular: true,
  },
  { name: 'Diaspora Physicians', price: 350, note: 'Conference registration', popular: false },
  {
    name: 'Low- and Middle-Income Country Nurses, Midwives & Allied Health',
    price: 150,
    note: 'Conference registration',
    popular: false,
  },
  {
    name: 'Low- and Middle-Income Country Physicians',
    price: 250,
    note: 'Conference registration',
    popular: false,
  },
  { name: 'Gala', price: 150, note: '9 January 2027 · Gala ticket', popular: false },
]

const SPONSORS = [
  { name: 'Gilead', logo: 'sponsor-gilead.svg', size: 'h-20 sm:h-24' },
  { name: 'AMN Healthcare', logo: 'sponsor-amn.png', size: 'h-14 sm:h-16' },
  { name: 'Trumerit', logo: 'sponsor-trumerit.png', size: 'h-20 sm:h-24' },
  { name: 'Health Carousel Foundation', logo: 'sponsor-health-carousel.png', size: 'h-20 sm:h-24' },
]

const FAQS = [
  {
    q: 'How do I pay?',
    a: 'Registrants in Ghana and across Africa can pay with Paystack (cards and mobile money). Everyone else pays with Zeffy. A confirmation email is sent once payment succeeds.',
  },
  {
    q: 'Can I buy more than one ticket type?',
    a: 'Each attendee holds one conference registration type. The Gala ticket is sold separately, so you can add it alongside your conference registration.',
  },
  {
    q: 'Who should attend?',
    a: 'Nurses, midwives, physicians, pharmacists, allied health professionals, researchers, and policy leaders from across Africa and the global Diaspora.',
  },
  {
    q: 'Do you offer accessibility support?',
    a: 'Yes. Use the Contact us button on this page to share your needs and our team will follow up before the event.',
  },
  {
    q: 'Where can I get help with payment?',
    a: 'For payment or accessibility questions, use the Contact us button on this page to reach the A-DNA team.',
  },
]

const PRIMARY_BTN =
  'inline-block w-full sm:w-auto text-center px-8 py-3 bg-pcna-green text-white font-bold rounded-md hover:bg-green-800 transition-all text-sm uppercase tracking-wider shadow-md hover:shadow-lg cursor-pointer'
const LIGHT_BTN =
  'inline-block w-full sm:w-auto text-center px-8 py-3 bg-white text-pcna-green font-bold rounded-md hover:bg-pcna-light transition-all text-sm uppercase tracking-wider shadow-md hover:shadow-lg'
const GHOST_BTN =
  'inline-block w-full sm:w-auto text-center px-8 py-3 border-2 border-white text-white font-bold rounded-md hover:bg-white hover:text-pcna-green transition-all text-sm uppercase tracking-wider'

function getTimeLeft(now: number) {
  const diff = Math.max(CONFERENCE_START - now, 0)
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Countdown() {
  const [time, setTime] = useState(() => getTimeLeft(Date.now()))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(Date.now())), 1000)
    return () => clearInterval(id)
  }, [])

  if (time.done) {
    return (
      <p className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider">
        #ADNA27 is underway. Welcome to Accra!
      </p>
    )
  }

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ]

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md"
      role="timer"
      aria-label={`${time.days} days, ${time.hours} hours and ${time.minutes} minutes until the conference opens`}
    >
      {units.map((u) => (
        <div
          key={u.label}
          className="bg-white/10 border border-white/20 rounded-xl py-3 text-center backdrop-blur-sm"
        >
          <div className="font-heading text-2xl sm:text-4xl font-black tabular-nums leading-none">
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="text-[0.6rem] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest mt-1 text-white/80">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p
      className={`mb-4 text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-white/70' : 'text-pcna-green'}`}
    >
      {children}
    </p>
  )
}

function SectionTitle({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <h2
      className="font-heading text-3xl sm:text-4xl md:text-5xl font-black leading-tight"
      style={{ color: light ? '#fff' : INK }}
    >
      {children}
    </h2>
  )
}

export function ConferenceHubPage() {
  const { open: openContact } = useContactDrawer()

  return (
    <div id="conference-hub" className="bg-white overflow-x-hidden">
      {/* Hero: full-bleed photo with gradient overlay */}
      <section className="relative flex items-end overflow-hidden min-h-[640px] sm:min-h-[720px] lg:min-h-[85vh] text-white">
        <img
          src={`${IMG}/dsc02866.jpg`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${INK} 0%, ${INK}b3 45%, ${INK}4d 100%)`,
          }}
        />
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pb-16 lg:pb-20">
          <span className="inline-block px-3 py-1 bg-pcna-red text-xs font-bold uppercase rounded-full shadow-sm mb-5">
            Registration open
          </span>
          <p className="font-bold uppercase tracking-widest text-xs sm:text-sm text-white/80">
            African-Diaspora Nursing Alliance presents
          </p>
          <p className="font-bold uppercase tracking-widest text-xs sm:text-sm mt-1">
            <span style={{ color: GOLD }}>#ADNA27</span> · Ghana 2027
          </p>
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black mt-4 leading-[1.05] max-w-4xl">
            The Future of African Healthcare
          </h1>
          <p className="text-lg sm:text-2xl font-bold mt-4 text-white/90">
            Diaspora Partnerships for Sustainable Impact
          </p>
          <p className="mt-5 text-base sm:text-lg text-white/85 max-w-2xl">
            Connect across disciplines. Build partnerships across continents. Join healthcare
            professionals from Africa and the Diaspora in Accra for shared ideas, lasting
            connections, and the vibrant culture of Ghana.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-10 font-bold">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">When</p>
              <p className="text-base sm:text-lg">7 to 9 January 2027</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Where</p>
              <p className="text-base sm:text-lg">
                University of Professional Studies, Accra (UPSA)
              </p>
              <p className="text-sm text-white/75">New Rd, Madina, Ghana</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#register" className={LIGHT_BTN}>
              Secure your seat
            </a>
            <a href="#week" className={GHOST_BTN}>
              Explore the summit
            </a>
          </div>

          <div className="mt-9">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">
              Conference opens in
            </p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* Conference film */}
      <section
        id="conference-film"
        className="scroll-mt-6 py-12 md:py-16"
        style={{ background: INK }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 text-white">
            <h2 className="font-heading text-2xl sm:text-3xl font-black">
              A-DNA Ghana Conference 2027
            </h2>
            <p className="font-bold uppercase tracking-widest text-sm" style={{ color: GOLD }}>
              #ADNA27
            </p>
          </div>
          {/* TODO: add a <track kind="captions"> once a caption file for the promo exists. */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className="aspect-video w-full rounded-lg bg-black"
            controls
            playsInline
            preload="metadata"
            poster={`${IMG}/conference-promo-poster.jpg`}
            aria-label="Watch the A-DNA 2027 conference video"
          >
            <source src={`${IMG}/conference-promo.mp4`} type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Why we gather */}
      <section
        id="about"
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32"
      >
        <div className="grid items-center gap-10 md:gap-14 md:grid-cols-2">
          <Reveal>
            <Eyebrow>Why we gather</Eyebrow>
            <SectionTitle>Diaspora expertise, delivered home.</SectionTitle>
            <p className="mt-6 text-gray-600 text-base sm:text-lg leading-relaxed">
              Your next partnership could start in Accra. Meet nurses, midwives, physicians,
              pharmacists, allied health professionals, researchers, and policy leaders from across
              Africa and the global Diaspora. Share your expertise, discover fresh perspectives, and
              build relationships that last beyond the conference.
            </p>
            <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
              Coming from the Diaspora? Make Ghana more than a destination. Reconnect with the
              continent through professional exchange and experience Ghanaian hospitality, food,
              music, and cultural traditions. Come for the connections. Leave with collaborators,
              memories, and a renewed sense of possibility.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <img
              src={`${IMG}/dsc03396.jpg`}
              alt="African-diaspora nursing leaders and clinicians together"
              loading="lazy"
              className="aspect-[3/2] w-full rounded-lg object-cover shadow-xl"
            />
          </Reveal>
        </div>

        <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-gray-200">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white p-6 sm:p-8 text-center">
              <div className="font-heading text-3xl sm:text-5xl font-black text-pcna-green">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-bold mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Summit week */}
      <section id="week" className="scroll-mt-6 bg-pcna-light py-16 sm:py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow>Summit week · January 2027</Eyebrow>
          <SectionTitle>One week. Three ways to show up.</SectionTitle>
          <div className="mt-10 sm:mt-14 grid gap-6 md:grid-cols-3">
            {SUMMIT_WEEK.map((e, i) => (
              <Reveal
                key={e.tag}
                as="div"
                delay={i + 1}
                className="flex flex-col rounded-3xl border border-black/10 bg-white p-6 sm:p-8 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 h-1 w-12 rounded-full" style={{ background: e.accent }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{e.tag}</p>
                <h3 className="font-heading mt-2 text-2xl font-black" style={{ color: INK }}>
                  {e.title}
                </h3>
                <p className="mt-4 flex-1 leading-relaxed text-gray-600">{e.body}</p>
                <div className="mt-6 space-y-1 border-t border-black/10 pt-5 text-sm font-bold text-gray-700">
                  <p>{e.date}</p>
                  <p>{e.place}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Last year in pictures */}
      <section
        id="highlights"
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32"
      >
        <Eyebrow>Highlights · A-DNA 2026</Eyebrow>
        <SectionTitle>Last year in pictures.</SectionTitle>
        <p className="mt-5 max-w-2xl text-gray-600 text-base sm:text-lg">
          Shared ideas, new friendships, and Ghanaian rhythms. Our 2026 gathering brought
          professions and continents together. Be part of the next chapter in Accra.
        </p>
        <div className="mt-10 sm:mt-14 grid grid-flow-dense grid-cols-2 auto-rows-[160px] sm:auto-rows-[200px] md:grid-cols-4 md:auto-rows-[230px] gap-3">
          {GALLERY.map((g) => {
            let spanClass = ''
            if (g.span === 'col') spanClass = 'col-span-2'
            else if (g.span === 'row') spanClass = 'row-span-2'
            return (
              <img
                key={g.src}
                src={`${IMG}/${g.src}`}
                alt={g.alt}
                loading="lazy"
                className={`h-full w-full rounded-2xl object-cover ${spanClass}`}
              />
            )
          })}
        </div>
      </section>

      {/* Programme / tracks */}
      <section
        id="tracks"
        className="scroll-mt-6 py-16 sm:py-24 md:py-32 text-white"
        style={{ background: INK }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow light>Programme</Eyebrow>
          <SectionTitle light>Eight tracks. One shared future.</SectionTitle>
          <ol className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRACKS.map((t, i) => (
              <li
                key={t}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
              >
                <span className="font-heading text-sm font-black" style={{ color: GOLD }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading mt-3 text-lg font-bold leading-snug">{t}</h3>
              </li>
            ))}
          </ol>

          <div className="mt-12 sm:mt-16 grid gap-6 md:grid-cols-2">
            {FEATURED_PANELS.map((p) => (
              <div key={p.title} className="rounded-3xl bg-pcna-green p-6 sm:p-10 shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Featured panel
                </p>
                <h3 className="font-heading mt-3 text-xl sm:text-2xl font-black">{p.title}</h3>
                <p className="mt-3 text-white/85">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration */}
      <section
        id="register"
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32"
      >
        <Eyebrow>Registration</Eyebrow>
        <SectionTitle>Choose your registration</SectionTitle>
        <p className="mt-5 max-w-2xl text-gray-600 text-base sm:text-lg">
          One registration type per attendee. Pay with Paystack (cards and mobile money) in Ghana
          and across Africa, or Zeffy everywhere else.
        </p>

        <div className="mt-10 sm:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REGISTRATION_TIERS.map((t) => {
            const isGala = t.name === 'Gala'
            let cardClass = 'bg-pcna-light border-transparent'
            if (t.popular) cardClass = 'bg-white border-pcna-green shadow-lg'
            else if (isGala) cardClass = 'text-white border-transparent'
            return (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-8 border-2 ${cardClass}`}
                style={isGala ? { background: INK } : undefined}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-pcna-red text-white text-xs font-bold uppercase rounded-full">
                    Most popular
                  </span>
                )}
                <h3
                  className="font-heading text-lg font-black"
                  style={{ color: isGala ? GOLD : INK }}
                >
                  {t.name}
                </h3>
                <p className="mt-4">
                  <span
                    className={`font-heading text-4xl font-black ${isGala ? 'text-white' : 'text-pcna-green'}`}
                  >
                    ${t.price}
                  </span>
                  <span className={`font-bold ml-1 ${isGala ? 'text-white/70' : 'text-gray-500'}`}>
                    USD
                  </span>
                </p>
                <p
                  className={`text-sm font-bold mt-1 mb-6 ${isGala ? 'text-white/70' : 'text-gray-500'}`}
                >
                  {t.note}
                </p>
                <Link
                  to={REGISTER_LINK.to}
                  hash={REGISTER_LINK.hash}
                  aria-label={isGala ? 'Get a Gala ticket' : `Register as ${t.name}`}
                  className={`${isGala ? LIGHT_BTN : PRIMARY_BTN} sm:w-full mt-auto`}
                >
                  {isGala ? 'Get Gala ticket' : 'Register'}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-gray-500 font-bold mt-8 text-sm">
          Payment or accessibility questions?{' '}
          <button
            type="button"
            onClick={openContact}
            className="text-pcna-green underline font-bold cursor-pointer"
          >
            Contact us
          </button>
        </p>
      </section>

      {/* Housing */}
      <section id="housing" className="scroll-mt-6 bg-pcna-light py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow>Stay</Eyebrow>
          <SectionTitle>Housing</SectionTitle>
          <p className="mt-5 text-gray-600 text-base sm:text-lg">
            Housing options for A-DNA Ghana Conference 2027 will be announced soon.
          </p>
        </div>
      </section>

      {/* Partner */}
      <section id="partner" className="scroll-mt-6 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
        <div
          className="max-w-6xl mx-auto rounded-3xl text-white grid gap-10 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:p-16 overflow-hidden"
          style={{ background: INK }}
        >
          <div>
            <Eyebrow light>Partner with us</Eyebrow>
            <h2 className="font-heading text-2xl sm:text-4xl font-black leading-tight">
              Put your mission in front of the people shaping Africa&apos;s health future.
            </h2>
            <p className="mt-5 text-white/80">
              Sponsorship spans the Conference, Gala, and Health Fair, with visibility, speaking,
              and community impact opportunities. A-DNA is a US-registered 501(c)(3) nonprofit.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <ul className="space-y-3 font-bold mb-8">
              <li className="flex gap-3">
                <span style={{ color: GOLD }}>✓</span> 1,000+ clinicians and leaders
              </li>
              <li className="flex gap-3">
                <span style={{ color: GOLD }}>✓</span> Reach across Africa and the diaspora
              </li>
              <li className="flex gap-3">
                <span style={{ color: GOLD }}>✓</span> Direct community health impact
              </li>
            </ul>
            <button type="button" onClick={openContact} className={`${LIGHT_BTN} cursor-pointer`}>
              Become a sponsor
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-6 bg-pcna-light py-16 sm:py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow>FAQ</Eyebrow>
          <SectionTitle>Good to know</SectionTitle>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-white rounded-xl shadow-sm p-5">
                <summary
                  className="cursor-pointer list-none flex justify-between items-center gap-4 font-bold"
                  style={{ color: INK }}
                >
                  {f.q}
                  <span className="text-pcna-green text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-gray-600 mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-pcna-green py-16 sm:py-20 text-center text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-bold uppercase tracking-widest text-sm text-white/80">
            Africa is in our DNA
          </p>
          <h2 className="font-heading text-3xl sm:text-5xl font-black mt-2">See you in Accra.</h2>
          <p className="font-bold mt-2" style={{ color: GOLD }}>
            #ADNA27
          </p>
          <a href="#register" className={`${LIGHT_BTN} mt-6`}>
            Register for ADNA27
          </a>
        </div>
      </section>

      {/* Sponsors */}
      <section
        id="sponsors"
        className="scroll-mt-6 bg-white py-14 sm:py-20"
        aria-labelledby="sponsors-title"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Eyebrow>Our sponsors</Eyebrow>
          <h2
            id="sponsors-title"
            className="font-heading text-2xl sm:text-4xl font-black"
            style={{ color: INK }}
          >
            Partners in lasting impact.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center">
            {SPONSORS.map((s) => (
              <img
                key={s.name}
                src={`${IMG}/${s.logo}`}
                alt={s.name}
                loading="lazy"
                className={`${s.size} w-full max-w-64 object-contain`}
              />
            ))}
          </div>
          <img
            src={`${IMG}/adna-gdna-logo.png`}
            alt="African-Diaspora Nursing Alliance and Ghanaian-Diaspora Nursing Alliance"
            loading="lazy"
            className="mx-auto mt-12 h-auto w-44 sm:w-56"
          />
        </div>
      </section>
    </div>
  )
}
