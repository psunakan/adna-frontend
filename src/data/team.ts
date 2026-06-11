export type TeamMember = {
  name: string
  credentials: string
  role: string
  image: string
  objectPosition?: string
  revealDelay?: number
}

export const EXECUTIVE_TEAM: TeamMember[] = [
  {
    name: 'Yvonne Commodore-Mensah',
    credentials: 'PhD, MHS, RN, FAAN',
    role: 'President',
    image: '/Pictures/Yvonne.png',
    revealDelay: 1,
  },
  {
    name: 'Matilda Decker',
    credentials: 'DNP, APRN, FNP-C',
    role: 'Vice-President',
    image: '/Pictures/Matilda.png',
    revealDelay: 2,
  },
  {
    name: 'Ruth-Alma Turkson-Ocran',
    credentials: 'PhD, MPH, APRN, FNP-BC, CNE',
    role: 'Executive Director/Secretary',
    image: '/Pictures/Ruth-Alma.png',
    revealDelay: 3,
  },
  {
    name: 'Daniel Apau',
    credentials: 'DNP, AGACNP',
    role: 'Financial Secretary',
    image: '/Pictures/Daniel.jpeg',
  },
  {
    name: 'Angela Agore',
    credentials: 'MRes, BSc, RN',
    role: 'Director of Research & UK Chapter Lead',
    image: '/Pictures/Angelanew.jpeg',
    objectPosition: 'center 15%',
    revealDelay: 4,
  },
  {
    name: 'Nana Yaa Addai',
    credentials: 'DNP, AGNP-C, CDIP',
    role: 'USA Chapter Lead',
    image: '/Pictures/Nana.jpeg',
  },
  {
    name: 'Jacqueline Idun',
    credentials: 'DNP,FNP',
    role: 'Director of Communications & Global Affairs',
    image: '/Pictures/Jacqueline.png',
    revealDelay: 6,
  },
  {
    name: 'Melonie Owusu',
    credentials: 'DNP, CRNP,FNP-BC,AAHIVS',
    role: 'Director of Strategic Partnerships',
    image: '/Pictures/Melonienew.jpeg',
    revealDelay: 7,
  },
  {
    name: 'Evelyn Amoako',
    credentials: 'MPH, RN',
    role: 'Strategic Advisor',
    image: '/Pictures/Evelyn.jpeg',
  },
  {
    name: 'Sa-ada Sadique',
    credentials: 'MScM, BSc, RM',
    role: 'Director of Midwifery',
    image: '/Pictures/Sadique.jpg',
  },
  {
    name: 'Ann Bonti',
    credentials: 'RN, BSN',
    role: "Director of Women's Health",
    image: '/Pictures/Ann.jpeg',
  },
  {
    name: 'Gifty Boateng',
    credentials: 'MSN, RN, BSN',
    role: 'Director of Innovation',
    image: '/Pictures/Gifty.jpeg',
  },
  {
    name: 'Stacey Bentil',
    credentials: 'DNP, MSN, RN',
    role: 'Director of Leadership Development',
    image: '/Pictures/Stacey.jpeg',
  },
  {
    name: 'Brenda Owusu',
    credentials: 'DNP, APRN, ANP-BC, FNP-BC',
    role: 'Co-Director of Education and Educational Policy',
    image: '/Pictures/Brenda.jpg',
  },
  {
    name: 'Vacant',
    credentials: 'Placeholder',
    role: 'Co-Director of Education and Educational Policy',
    image: '/Pictures/CoDir.jpg',
    objectPosition: 'center 15%',
  },
  {
    name: 'Gifty Markey',
    credentials: 'Msc, BSN, RN',
    role: 'UK Chapter Director -at-Large',
    image: '/Pictures/Gifty.png',
    revealDelay: 5,
  },
  {
    name: 'Stephen Adombire',
    credentials: 'MScN, BScN, RN',
    role: 'Director of Evidence Based Practice',
    image: '/Pictures/Stephen.jpeg',
  },
  {
    name: 'Harriet Obenewah Tegah',
    credentials: 'MSc,BSN, RN',
    role: 'Director of Administration',
    image: '/Pictures/Harriet.png',
    revealDelay: 8,
  },
]
