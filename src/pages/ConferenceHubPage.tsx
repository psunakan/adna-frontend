import { useEffect, useRef, useState } from 'react'
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

// `tint` recolors an all-white logo (used as a CSS mask) so it reads on the white section.
// `ratio` is the logo file's width/height, needed to size the masked element.
// `size` overrides the default max-height classes so a logo matches the others' visual weight.
const SPONSORS: { name: string; logo: string; tint?: string; ratio?: string; size?: string }[] = [
  { name: 'Gilead', logo: 'sponsor-gilead.svg' },
  { name: 'AMN Healthcare', logo: 'sponsor-amn.png', size: 'max-h-16 sm:max-h-20' },
  { name: 'Trumerit', logo: 'sponsor-trumerit.png', size: 'max-h-16 sm:max-h-20' },
  {
    name: 'Health Carousel Foundation',
    logo: 'sponsor-health-carousel.png',
    tint: '#1f2b5b',
    ratio: '600 / 130',
  },
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

// ---------------------------------------------------------------------------
// Housing (STAY): partner-rate directory. Email addresses and URLs live only in
// the data/hrefs below and are never printed in the UI; visitors use buttons.
// ---------------------------------------------------------------------------
const EMAIL_RATE_CODE = 'G-DNA2027'
const MJ_PROMO_CODE = 'GDNA27'

type HousingCategory = 'partner' | 'standard' | 'all'

type Hotel = {
  id: string
  name: string
  category: 'partner' | 'standard'
  badge: string
  summary: string
  location: string
  rates: { label: string; price: string; unit: string }[]
  booking: 'email' | 'promo' | 'website'
  email?: string
  code?: string
  url: string
  steps: string[]
}

const HOTELS: Hotel[] = [
  {
    id: 'mensvic',
    name: 'Mensvic Grand Hotel',
    category: 'partner',
    badge: 'Partner Rate · Email Booking',
    summary: 'Single $100 · Double $150',
    location: 'Accra, Ghana',
    rates: [
      { label: 'Single', price: '$100', unit: '/ night' },
      { label: 'Double', price: '$150', unit: '/ night' },
    ],
    booking: 'email',
    email: 'info@mensvichotels.com',
    code: EMAIL_RATE_CODE,
    url: 'https://mensvichotels.com',
    steps: [
      `Select Request via Email to send a reservation request referencing code ${EMAIL_RATE_CODE}.`,
      'Confirm your check-in/check-out dates and room preference (Single or Double).',
    ],
  },
  {
    id: 'tomreik',
    name: 'Tomreik Hotel',
    category: 'partner',
    badge: 'Partner Rate · Email Booking',
    summary: 'Standard $100 · Deluxe $130',
    location: 'Accra, Ghana',
    rates: [
      { label: 'Standard', price: '$100', unit: '/ night' },
      { label: 'Deluxe', price: '$130', unit: '/ night' },
    ],
    booking: 'email',
    email: 'reservation@tomreikhotel.com',
    code: EMAIL_RATE_CODE,
    url: 'https://tomreikhotel.com',
    steps: [
      `Select Request via Email to request your room referencing code ${EMAIL_RATE_CODE}.`,
      'Specify whether you prefer a Standard ($100) or Deluxe ($130) room.',
    ],
  },
  {
    id: 'erata',
    name: 'Erata Hotel',
    category: 'partner',
    badge: 'Partner Rate · Email Booking',
    summary: 'Single GHS 1,000 · Double GHS 1,300',
    location: 'Accra, Ghana',
    rates: [
      { label: 'Single', price: 'GHS 1,000', unit: '/ night' },
      { label: 'Double', price: 'GHS 1,300', unit: '/ night' },
    ],
    booking: 'email',
    email: 'info@eratahotel.com',
    code: EMAIL_RATE_CODE,
    url: 'https://eratahotel.com',
    steps: [
      `Select Request via Email to request the partner rate referencing code ${EMAIL_RATE_CODE}.`,
      'Share your travel dates and Single or Double room selection.',
    ],
  },
  {
    id: 'mj-grand',
    name: 'MJ Grand Hotel',
    category: 'partner',
    badge: '20% Off Advertised Rates',
    summary: `From $80 · Code ${MJ_PROMO_CODE}`,
    location: 'Accra, Ghana',
    rates: [
      { label: 'Single / Standard / Deluxe', price: '$80', unit: '/ night' },
      { label: 'Twin Bed', price: '$120', unit: '/ night' },
      { label: 'Junior Suite', price: '$150', unit: '/ night' },
      { label: 'Executive', price: '$160', unit: '/ night' },
    ],
    booking: 'promo',
    code: MJ_PROMO_CODE,
    url: 'https://mjgrandhotelghana.com/booking',
    steps: [
      `Copy promo code ${MJ_PROMO_CODE} and open the booking portal with Book Online.`,
      `Enter ${MJ_PROMO_CODE} during the normal guest booking flow to apply the 20% discount.`,
    ],
  },
  {
    id: 'bonsukoda',
    name: 'Bonsukoda Lodge and Studios',
    category: 'partner',
    badge: 'Partner Offer · GHS 100 Off Studios',
    summary: 'GHS 100 off studios',
    location: 'Accra, Ghana',
    rates: [{ label: 'Studios', price: 'GHS 100 off', unit: 'partner discount' }],
    booking: 'website',
    url: 'https://bonsukodalodge.com',
    steps: [
      'Browse studio availability directly on the lodge website.',
      'Mention A-DNA / G-DNA 2027 to receive GHS 100 off studios.',
    ],
  },
  {
    id: 'marriott',
    name: 'Accra Marriott Hotel',
    category: 'standard',
    badge: 'Standard Rates',
    summary: 'Standard rates',
    location: 'Accra, Ghana',
    rates: [{ label: 'Published availability', price: 'Standard Rates', unit: 'direct booking' }],
    booking: 'website',
    url: 'https://www.marriott.com',
    steps: [
      'Recommended Accra hotel available at standard published rates.',
      'Select Visit Website to check room dates and book directly.',
    ],
  },
  {
    id: 'movenpick',
    name: 'Mövenpick Ambassador Hotel Accra',
    category: 'standard',
    badge: 'Standard Rates',
    summary: 'Standard rates',
    location: 'Accra, Ghana',
    rates: [{ label: 'Published availability', price: 'Standard Rates', unit: 'direct booking' }],
    booking: 'website',
    url: 'https://movenpick.accor.com',
    steps: [
      'Recommended Accra hotel available at standard published rates.',
      'Select Visit Website to check room availability and reserve.',
    ],
  },
  {
    id: 'kempinski',
    name: 'Kempinski Hotel Gold Coast City',
    category: 'standard',
    badge: 'Standard Rates',
    summary: 'Standard rates',
    location: 'Accra, Ghana',
    rates: [{ label: 'Rooms & suites', price: 'Standard Rates', unit: 'direct booking' }],
    booking: 'website',
    url: 'https://www.kempinski.com/en/hotel-gold-coast-city/rooms-suites#rooms',
    steps: [
      'Recommended Accra hotel available at standard published rates.',
      'Select Visit Website to view rooms and suites directly.',
    ],
  },
  {
    id: 'palms',
    name: 'The Palms by Eagles (Airport City)',
    category: 'standard',
    badge: 'Standard Rates',
    summary: 'Standard rates',
    location: 'Airport City, Accra',
    rates: [{ label: 'Published availability', price: 'Standard Rates', unit: 'direct booking' }],
    booking: 'website',
    url: 'https://palmsbyeagles.com',
    steps: [
      'Recommended Airport City hotel available at standard published rates.',
      'Select Visit Website to check availability and book.',
    ],
  },
]

const HOUSING_TABS: { key: HousingCategory; label: string }[] = [
  { key: 'partner', label: 'Partner Rates' },
  { key: 'standard', label: 'Standard Rates' },
  { key: 'all', label: 'All Stays' },
]

const BRAND_GRADIENT = 'linear-gradient(90deg, #c8102e 0%, #fcd116 50%, #0f6b4a 100%)'

const H_BTN = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer'
const H_BTN_PRIMARY = `${H_BTN} bg-[#0E4A30] text-white hover:bg-[#0B2E1F]`
const H_BTN_SOFT = `${H_BTN} border border-[#0E4A30]/25 bg-[#F4F6F5] text-[#0B2E1F] hover:bg-[#0E4A30]/10`
const H_BTN_GOLD = `${H_BTN} border border-[#C89B2B]/45 bg-[#C89B2B]/15 text-[#0B2E1F] hover:bg-[#C89B2B]/25`
const H_BTN_GHOST = `${H_BTN} border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F4F6F5] hover:text-[#0B2E1F]`

function buildMailto(hotel: Hotel) {
  const code = hotel.code ?? EMAIL_RATE_CODE
  const subject = `A-DNA 2027 Room Reservation (${code})`
  const body =
    `Hello ${hotel.name} Reservations Team,\n\n` +
    `I am attending the A-DNA / G-DNA Ghana Conference 2027 and would like to request the partner rate using code ${code}.\n\n` +
    'Check-in date:\nCheck-out date:\nRoom type:\nGuest name:\n\nThank you.'
  return `mailto:${hotel.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(ta)
    }
  }
}

function HousingSection() {
  const [category, setCategory] = useState<HousingCategory>('partner')
  const [selectedId, setSelectedId] = useState(HOTELS[0].id)
  const [emailHotel, setEmailHotel] = useState<Hotel | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const filtered = category === 'all' ? HOTELS : HOTELS.filter((h) => h.category === category)
  const selected = filtered.find((h) => h.id === selectedId) ?? filtered[0]
  const countFor = (key: HousingCategory) =>
    key === 'all' ? HOTELS.length : HOTELS.filter((h) => h.category === key).length

  const copy = async (code: string) => {
    await copyToClipboard(code)
    setCopied(code)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(null), 2000)
  }

  const selectHotel = (id: string) => {
    setSelectedId(id)
    // On stacked (mobile/tablet) layouts the details card sits below the list.
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      spotlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const openEmail = (hotel: Hotel) => {
    setEmailHotel(hotel)
    dialogRef.current?.showModal()
  }
  const closeEmail = () => dialogRef.current?.close()

  const copyLabel = (code: string, prefix = 'Code') =>
    copied === code ? (
      <>✓ Copied</>
    ) : (
      <>
        {prefix}: <span className="ml-1 font-mono">{code}</span>
      </>
    )

  const renderActions = (hotel: Hotel) => {
    const site = (
      <a
        href={hotel.url}
        target="_blank"
        rel="noopener noreferrer"
        className={hotel.booking === 'website' ? H_BTN_PRIMARY : H_BTN_GHOST}
      >
        Visit Website
      </a>
    )
    if (hotel.booking === 'email' && hotel.code) {
      return (
        <>
          <button type="button" onClick={() => openEmail(hotel)} className={H_BTN_PRIMARY}>
            Request via Email
          </button>
          <button type="button" onClick={() => copy(hotel.code!)} className={H_BTN_SOFT}>
            {copyLabel(hotel.code)}
          </button>
          {site}
        </>
      )
    }
    if (hotel.booking === 'promo' && hotel.code) {
      return (
        <>
          <a href={hotel.url} target="_blank" rel="noopener noreferrer" className={H_BTN_PRIMARY}>
            Book Online
          </a>
          <button type="button" onClick={() => copy(hotel.code!)} className={H_BTN_GOLD}>
            {copyLabel(hotel.code, 'Promo code')}
          </button>
        </>
      )
    }
    return (
      <>
        {site}
        {hotel.id === 'bonsukoda' && (
          <span className="inline-flex items-center rounded-xl border border-[#C89B2B]/35 bg-[#C89B2B]/12 px-3.5 py-2 text-xs font-semibold text-[#0B2E1F]">
            GHS 100 off studios
          </span>
        )}
      </>
    )
  }

  const badgeTone = (hotel: Hotel) => {
    if (hotel.booking === 'promo') return 'bg-[#C89B2B]/15 text-[#0B2E1F] border-[#C89B2B]/40'
    if (hotel.category === 'partner') return 'bg-[#0E4A30]/10 text-[#0E4A30] border-[#0E4A30]/20'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }
  const pillTone = (hotel: Hotel) => {
    if (hotel.booking === 'promo') return 'bg-[#C89B2B]/15 text-[#0B2E1F]'
    if (hotel.category === 'partner') return 'bg-[#0E4A30]/10 text-[#0B2E1F]'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <section
      id="housing"
      aria-labelledby="housing-title"
      className="scroll-mt-6 bg-[#0b2e1f] px-3 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border-2 border-[#1f6b48] bg-[#F4F6F5] shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
        <div aria-hidden="true" className="h-1 w-full" style={{ background: BRAND_GRADIENT }} />

        <div className="px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          {/* Header + category filter */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Stay</Eyebrow>
              <h2
                id="housing-title"
                className="font-heading text-3xl sm:text-4xl font-black leading-tight"
                style={{ color: INK }}
              >
                Housing &amp; Partner Rates
              </h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#475569]">
                Negotiated conference rates in Accra for A-DNA / G-DNA 2027 attendees. Reference your
                code when booking partner properties.
              </p>
            </div>
            <div
              role="group"
              aria-label="Filter housing by rate type"
              className="inline-flex flex-wrap gap-1 self-start rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-2xs lg:self-end"
            >
              {HOUSING_TABS.map((t) => {
                const active = category === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(t.key)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#0E4A30] text-white shadow-2xs'
                        : 'text-[#475569] hover:bg-[#F4F6F5] hover:text-[#0F172A]'
                    }`}
                  >
                    {t.label} ({countFor(t.key)})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Promo code quick-copy bar */}
          <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-2xs sm:px-5">
            <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
              <p className="text-xs leading-snug text-[#475569] sm:text-sm">
                <strong className="font-semibold text-[#0B2E1F]">Email-rate hotels:</strong> request
                Mensvic, Tomreik &amp; Erata by email using{' '}
                <span className="font-semibold text-[#0E4A30]">{EMAIL_RATE_CODE}</span>.{' '}
                <strong className="font-semibold text-[#0B2E1F]">MJ Grand:</strong> apply{' '}
                <span className="font-semibold text-[#9a7414]">{MJ_PROMO_CODE}</span> online.
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(EMAIL_RATE_CODE)}
                  className="inline-flex items-center rounded-xl border border-[#0E4A30]/25 bg-[#F4F6F5] px-3 py-1.5 text-xs font-semibold text-[#0B2E1F] transition hover:bg-[#0E4A30] hover:text-white cursor-pointer"
                >
                  {copied === EMAIL_RATE_CODE ? '✓ Copied' : <>Copy <strong className="ml-1 font-mono">{EMAIL_RATE_CODE}</strong></>}
                </button>
                <button
                  type="button"
                  onClick={() => copy(MJ_PROMO_CODE)}
                  className="inline-flex items-center rounded-xl border border-[#C89B2B]/40 bg-[#C89B2B]/12 px-3 py-1.5 text-xs font-semibold text-[#0B2E1F] transition hover:bg-[#C89B2B] hover:text-white cursor-pointer"
                >
                  {copied === MJ_PROMO_CODE ? '✓ Copied' : <>Copy <strong className="ml-1 font-mono">{MJ_PROMO_CODE}</strong></>}
                </button>
              </div>
            </div>
          </div>

          {/* Split directory: hotel list + details card */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F4F6F5]/70 px-4 py-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2E1F]">
                    {HOUSING_TABS.find((t) => t.key === category)?.label} ({filtered.length})
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Select a hotel</span>
                </div>
                <ul className="divide-y divide-[#E2E8F0] lg:max-h-[430px] lg:overflow-y-auto">
                  {filtered.map((h) => {
                    const isSel = h.id === selected?.id
                    return (
                      <li key={h.id}>
                        <button
                          type="button"
                          aria-pressed={isSel}
                          onClick={() => selectHotel(h.id)}
                          className={`flex w-full items-center justify-between gap-3 border-l-4 px-4 py-3 text-left transition cursor-pointer ${
                            isSel
                              ? 'border-l-[#0E4A30] bg-[#0E4A30]/[0.07]'
                              : 'border-l-transparent bg-white hover:bg-[#F4F6F5]/75'
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-[#0B2E1F]">{h.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">{h.summary}</span>
                          </span>
                          <span
                            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${pillTone(h)}`}
                          >
                            {h.category === 'partner' ? 'Partner' : 'Standard'}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {selected && (
              <div ref={spotlightRef} className="scroll-mt-6 lg:col-span-7">
                <article
                  aria-live="polite"
                  className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs"
                >
                  <div aria-hidden="true" className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${badgeTone(selected)}`}
                      >
                        {selected.badge}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{selected.location}</span>
                    </div>
                    <h3 className="mt-2.5 text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B2E1F]">
                      {selected.name}
                    </h3>

                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rates</p>
                      <div
                        className={`mt-2 grid grid-cols-1 gap-2 ${selected.rates.length > 1 ? 'sm:grid-cols-2' : ''}`}
                      >
                        {selected.rates.map((r) => (
                          <div
                            key={r.label}
                            className="flex items-baseline justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F4F6F5] px-3.5 py-2.5"
                          >
                            <span className="text-xs font-medium text-[#475569]">{r.label}</span>
                            <span className="text-right">
                              <span className="text-sm sm:text-base font-extrabold text-[#0B2E1F]">{r.price}</span>
                              <span className="ml-1 text-[11px] text-slate-500">{r.unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F4F6F5]/75 p-3.5 sm:p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0B2E1F]">Booking details</p>
                      <ol className="mt-2 space-y-1.5">
                        {selected.steps.map((s, i) => (
                          <li key={s} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#475569]">
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0E4A30] text-[11px] font-bold text-white">
                              {i + 1}
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-[#E2E8F0] pt-4">
                      {renderActions(selected)}
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email reservation helper (keeps raw addresses out of the card UI) */}
      <dialog
        ref={dialogRef}
        aria-labelledby="email-modal-title"
        onClose={() => setEmailHotel(null)}
        className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-xl backdrop:bg-[#0B2E1F]/55"
      >
        {emailHotel && (
          <>
            <div aria-hidden="true" className="h-1.5 w-full" style={{ background: BRAND_GRADIENT }} />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-full bg-[#0E4A30]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0E4A30]">
                    Direct email reservation
                  </span>
                  <h3 id="email-modal-title" className="mt-2 text-lg font-extrabold text-[#0B2E1F]">
                    {emailHotel.name} · Email Booking
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeEmail}
                  aria-label="Close reservation helper"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#F4F6F5] hover:text-[#0F172A] cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#475569]">
                Your mail app will open with a pre-filled A-DNA / G-DNA 2027 reservation draft. Be sure
                to reference your booking code when sending.
              </p>
              <div className="mt-4 space-y-1.5 rounded-xl border border-[#E2E8F0] bg-[#F4F6F5] p-3.5 text-xs text-[#334155]">
                <p>
                  <strong className="font-semibold text-[#0B2E1F]">Subject:</strong> A-DNA 2027 Room
                  Reservation ({emailHotel.code})
                </p>
                <p>
                  <strong className="font-semibold text-[#0B2E1F]">Reference code:</strong>{' '}
                  <span className="font-mono font-bold text-[#0E4A30]">{emailHotel.code}</span>
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => emailHotel.code && copy(emailHotel.code)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F4F6F5] px-3.5 py-2 text-xs font-semibold text-[#0B2E1F] transition hover:bg-slate-200/70 cursor-pointer"
                >
                  {copied === emailHotel.code ? '✓ Copied' : 'Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={closeEmail}
                  className="inline-flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#475569] transition hover:text-[#0F172A] cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={buildMailto(emailHotel)}
                  onClick={closeEmail}
                  className="inline-flex items-center justify-center rounded-xl bg-[#0E4A30] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0B2E1F]"
                >
                  Open Mail App
                </a>
              </div>
            </div>
          </>
        )}
      </dialog>

      {/* Copy confirmation */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#C89B2B]/40 bg-[#0B2E1F] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all duration-200 ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {copied && (
          <>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0E4A30] text-[#C89B2B]">
              ✓
            </span>
            {copied} copied to clipboard
          </>
        )}
      </div>
    </section>
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
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pb-12 lg:pb-14">
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

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#register" className={LIGHT_BTN}>
              Secure your seat
            </a>
            <a href="#week" className={GHOST_BTN}>
              Explore the summit
            </a>
          </div>

          <div className="mt-6">
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
        className="scroll-mt-6 py-8 md:py-12"
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
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20"
      >
        <div className="grid items-center gap-7 md:gap-10 md:grid-cols-2">
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

        <div className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-gray-200">
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
      <section id="week" className="scroll-mt-6 bg-pcna-light py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow>Summit week · January 2027</Eyebrow>
          <SectionTitle>One week. Three ways to show up.</SectionTitle>
          <div className="mt-7 sm:mt-10 grid gap-6 md:grid-cols-3">
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
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20"
      >
        <Eyebrow>Highlights · A-DNA 2026</Eyebrow>
        <SectionTitle>Last year in pictures.</SectionTitle>
        <p className="mt-5 max-w-2xl text-gray-600 text-base sm:text-lg">
          Shared ideas, new friendships, and Ghanaian rhythms. Our 2026 gathering brought
          professions and continents together. Be part of the next chapter in Accra.
        </p>
        <div className="mt-7 sm:mt-10 grid grid-flow-dense grid-cols-2 auto-rows-[160px] sm:auto-rows-[200px] md:grid-cols-4 md:auto-rows-[230px] gap-3">
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
        className="scroll-mt-6 py-12 sm:py-16 md:py-20 text-white"
        style={{ background: INK }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow light>Programme</Eyebrow>
          <SectionTitle light>Eight tracks. One shared future.</SectionTitle>
          <ol className="mt-7 sm:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-8 sm:mt-11 grid gap-6 md:grid-cols-2">
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
        className="scroll-mt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20"
      >
        <Eyebrow>Registration</Eyebrow>
        <SectionTitle>Choose your registration</SectionTitle>
        <p className="mt-5 max-w-2xl text-gray-600 text-base sm:text-lg">
          One registration type per attendee. Pay with Paystack (cards and mobile money) in Ghana
          and across Africa, or Zeffy everywhere else.
        </p>

        <div className="mt-7 sm:mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <p className="text-gray-500 font-bold mt-6 text-sm">
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
      <HousingSection />

      {/* Partner */}
      <section id="partner" className="scroll-mt-6 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div
          className="max-w-6xl mx-auto rounded-3xl text-white grid gap-7 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:p-12 overflow-hidden"
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
      <section id="faq" className="scroll-mt-6 bg-pcna-light py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Eyebrow>FAQ</Eyebrow>
          <SectionTitle>Good to know</SectionTitle>
          <div className="mt-7 space-y-3">
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
      <section className="bg-pcna-green py-12 sm:py-14 text-center text-white">
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
        className="scroll-mt-6 bg-white py-10 sm:py-12"
        aria-labelledby="sponsors-title"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-pcna-green">
            Our sponsors
          </p>
          <h2
            id="sponsors-title"
            className="font-heading text-2xl sm:text-4xl font-black"
            style={{ color: INK }}
          >
            Partners in lasting impact.
          </h2>
          <div className="mx-auto mt-8 sm:mt-10 max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 sm:gap-x-8 items-center justify-items-center">
            {SPONSORS.map((s) => (
              <div
                key={s.name}
                className="flex h-16 sm:h-20 w-full max-w-[240px] items-center justify-center"
              >
                {s.tint ? (
                  <div
                    role="img"
                    aria-label={s.name}
                    className="h-10 sm:h-12 lg:h-14 max-w-full"
                    style={{
                      aspectRatio: s.ratio,
                      backgroundColor: s.tint,
                      WebkitMask: `url(${IMG}/${s.logo}) center / contain no-repeat`,
                      mask: `url(${IMG}/${s.logo}) center / contain no-repeat`,
                    }}
                  />
                ) : (
                  <img
                    src={`${IMG}/${s.logo}`}
                    alt={s.name}
                    loading="lazy"
                    className={`block ${s.size ?? 'max-h-10 sm:max-h-12 lg:max-h-14'} w-auto max-w-full object-contain`}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="mt-8 sm:mt-10 mb-5 sm:mb-6 h-[3px] w-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #c8102e, #fcd116, #0f6b4a)' }}
          />
          <div className="flex flex-col items-center">
            <div
              className="relative max-w-full rounded-2xl px-6 py-4 sm:px-9 sm:py-6 shadow-[0_18px_40px_-12px_rgba(11,46,31,0.55)]"
              style={{ background: 'linear-gradient(135deg, #0b2e1f, #0a2419)' }}
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-[14px] right-[14px] h-[3px] rounded-full"
                style={{ background: 'linear-gradient(90deg, #c8102e, #fcd116, #0f6b4a)' }}
              />
              <img
                src={`${IMG}/adna-gdna-logo.png`}
                alt="African-Diaspora Nursing Alliance and Ghanaian-Diaspora Nursing Alliance"
                loading="lazy"
                className="block h-14 sm:h-20 w-auto max-w-full object-contain"
              />
            </div>
            <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#8a8a8a]">
              A joint initiative of A-DNA &amp; G-DNA
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
