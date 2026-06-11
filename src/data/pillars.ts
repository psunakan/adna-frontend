export type Pillar = {
  id: number
  title: string
  shortTitle: string
  desc: string
  banner: string
  imgs: string[]
}

export const PILLARS: Pillar[] = [
  {
    id: 1,
    title: 'Education & Training',
    shortTitle: 'Education & Training',
    desc: 'Delivering world-class educational and training opportunities that elevate professional and care standards across Africa and the global diaspora.',
    banner: '/Pictures/edu_01.jpg',
    imgs: ['edu_01.jpg', 'edu_02.jpg', 'edu_03.jpeg', 'edu_04.jpeg', 'edu_05.jpeg', 'edu_06.jpeg'],
  },
  {
    id: 2,
    title: 'Advocacy & Policy',
    shortTitle: 'Advocacy & Policy',
    desc: "Championing policies that protect nurses' rights, improve working conditions, and strengthen health systems globally.",
    banner: '/Pictures/Adu_01.jpeg',
    imgs: [
      'Adu_01.jpeg',
      'Adu_02.jpeg',
      'Adu_03.jpeg',
      'Adu_04.jpeg',
      'Adu_05.jpeg',
      'Adu_06.jpeg',
    ],
  },
  {
    id: 3,
    title: 'Research, QI & Evidence-Based Practice',
    shortTitle: 'Research, QI & EBP',
    desc: 'Advancing research, evidence-based practice (EBP) and quality improvement (QI) to drive measurable, lasting health outcomes.',
    banner: '/Pictures/Res_01.jpg',
    imgs: [
      'Res_01.jpg',
      'Res_02.JPG',
      'Res_03.jpg',
      'Res_04.jpeg',
      'WhatsApp_Image_2026-04-26_at_10.21.19_PM.jpeg',
      'WhatsApp_Image_2026-04-26_at_10.21.20_PM.jpeg',
    ],
  },
  {
    id: 4,
    title: 'Innovation',
    shortTitle: 'Innovation',
    desc: 'Harnessing digital health, AI, and creative thinking to transform nursing practice, education and patient care delivery.',
    banner: '/Pictures/Inn_01.JPG',
    imgs: [
      'Inn_01.JPG',
      'Inn_02.JPG',
      'Inn_03.JPG',
      'Inn_04.JPG',
      'WhatsApp_Image_2026-04-26_at_10.40.42_PM.jpeg',
      'WhatsApp_Image_2026-04-26_at_10.40.46_PM.jpeg',
    ],
  },
  {
    id: 5,
    title: 'Community Impact',
    shortTitle: 'Community Impact',
    desc: 'Mobilizing our diverse member networks to deliver health education, community outreach, and direct care where it matters most.',
    banner: '/Pictures/Comm_01.JPG',
    imgs: [
      'Comm_01.JPG',
      'Comm_02.jpeg',
      'Comm_03.jpeg',
      'Comm_04.jpeg',
      'Comm_05.jpeg',
      'Comm_06.jpeg',
    ],
  },
]
