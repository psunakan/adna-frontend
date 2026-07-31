// Agenda content transcribed verbatim from "ADNA26 Conference Agenda_7_27_26.docx".
// Hardcoded here for the 2026 launch under time pressure — move this to Supabase in a
// later pass so future years' agendas can be updated without a code deploy.

export type ProgramSession = {
  time: string
  title: string
  format: string
  sponsor?: string
  details?: string[]
}

export type ProgramDay = {
  id: 'day1' | 'day2'
  label: string
  dateLabel: string
  sessions: ProgramSession[]
}

export const PROGRAM_EYEBROW = 'ADNA26 Conference Agenda'
export const PROGRAM_TITLE =
  '“Voices of Change: Translating Innovation into Action for Global Health”'
export const PROGRAM_SUBTITLE = 'August 21–22, 2026 · Johns Hopkins School of Nursing'
export const PROGRAM_LOCATION = '525 N. Wolfe Street, Baltimore, Maryland 21205'

export const PROGRAM_DAYS: ProgramDay[] = [
  {
    id: 'day1',
    label: 'Day One',
    dateLabel: 'Friday, August 21, 2026',
    sessions: [
      {
        time: '8:00 AM',
        title: 'Conference Registration, Visit Exhibits & Welcome Breakfast',
        format: 'Registration',
      },
      {
        time: '9:00 AM – 9:30 AM',
        title:
          "No Bed, No Excuse: Closing Africa's Emergency Care Gap Through Multidisciplinary Collaboration and Diaspora-Driven Innovation",
        format: 'Keynote',
        details: ['Dr. Bertha Serwaa Ayi'],
      },
      {
        time: '9:30 AM – 11:00 AM',
        title:
          "No Bed, No Excuse: Closing Africa's Emergency Care Gap Through Multidisciplinary Collaboration and Diaspora-Driven Innovation",
        format: 'Panel',
        details: [
          'Panelists',
          '— Dr. Bertha Serwaa Ayi, Former President, Ghana Physicians and Surgeons Foundation (GPSF)',
          '— Emmanuel Acheampong, Nurse Lead, African Federation for Emergency Medicine; Registered Emergency Nurse, Komfo Anokye Teaching Hospital, Ghana',
          '— Dr. Patience Afulani, National Vice President, Ghana Physicians and Surgeons Foundation (GPSF)',
          '— Dr. Tegan Lukacs, Associate Professor of Emergency Medicine, Johns Hopkins Medicine, Center for Global Emergency Care',
          '— Dr. Esther Peter, President, National Association of Nigerian Nurses in North America (NANNA), DMV Chapter',
        ],
      },
      {
        time: '11:00 AM – 11:15 AM',
        title: 'Break / Visit Exhibits',
        format: 'Break',
      },
      {
        time: '11:15 AM – 12:15 PM',
        title: 'Concurrent Breakout Sessions — Morning',
        format: 'Breakout',
        details: [
          'Choose one',
          'A   Advancing Advanced Practice: Training & Integrating APN and Specialist Roles in African Healthcare Systems',
          "Dr. Rita D'Aoust · Dr. Daniel Apau · Dr. Matilda Decker · Dr. Brenda Owusu",
          'B   Status-Neutral HIV/ID Care: Practical Primary Care Strategies for Local and Global Health',
          'Dr. Melonie Owusu · Trina Scott',
          'C   From Evidence to Action: Transforming Postpartum Care Globally to Save Lives',
          'Dr. Janet Williams · Ann Bonti',
        ],
      },
      {
        time: '12:15 PM – 1:15 PM',
        title: 'Lunch, Networking & Visit Exhibits',
        format: 'Lunch & Exhibits',
      },
      {
        time: '12:30 PM – 1:15 PM',
        title: 'Poster Presentations',
        format: 'Posters',
      },
      {
        time: '1:15 PM – 2:00 PM',
        title: 'Oral Presentations',
        format: 'Oral Presentations',
        details: [
          'Olufunmilola Faminu — Perception of labour pain and willingness to use pain relief among pregnant women attending the antenatal clinic at UCH, Nigeria',
          'Donald Amenah — Barriers and Facilitators to Clinical Competency Acquisition and Maintenance Among Nurses in Ghana: A Convergent Integrated Mixed-Methods Systematic Review',
          'Anna Mensah-Nti — Effectiveness of the Myself Model: A Nurse-Led Intervention to Reduce Cultural Stigmatization Among Older Immigrants Receiving HCBS',
        ],
      },
      {
        time: '2:00 PM – 3:20 PM',
        title:
          'Translating Ethical Recruitment into Reinvestment: Innovation and Partnership Models in Global Healthcare Workforce Mobility',
        format: 'Keynote',
        sponsor: 'Sponsored by Trumerit',
        details: [
          'Opening Remarks  Ambassador Victor Smith, Ghana Ambassador to the United States',
          'Featured Presentation  Dr. Peter Preziosi, Chief Executive Officer, Trumerit',
          'Panelists',
          '— Dr. Manjula Luthria, Senior Labor Economist, World Bank',
          '— Amber Sprengard, Vice President, Government Affairs, Health Carousel Foundation',
          '— Perpetual Ofori-Ampofo, President, Ghana Registered Nurses and Midwives Association (GRNMA)',
          '— Dr. Deborah Baker, Senior Vice President for Nursing, Johns Hopkins Health System',
          '— Melissa Ryan Kemburu, Director, Office of Global Health, Health Resources and Services Administration (HRSA)',
        ],
      },
      {
        time: '3:30 PM',
        title: 'Concurrent Breakout Sessions — Afternoon',
        format: 'Breakout',
        details: [
          'Choose one',
          'A   Building Wealth with Purpose: Financial Literacy for Healthcare Professionals',
          'Dr. Eugenia Caternor · Mr. Terry English · Eunice Adu',
          'B   Advocacy in Action: Healthcare Policy Training for Global Health Champions',
          'CARE International / GHPAC',
          'Anne Danhoffer, CARE International · Adjoa Kyerematen, Ghana Diaspora Public Affairs Collective',
          'C   Intelligence for Impact: Leveraging AI & Machine Learning to Strengthen the African Health Workforce',
          'Dr. Thomas Osborne, Microsoft · James Leuthe, Scopewell Solutions',
          'D   Leading the Future: Health Equity, Innovation, and the Next Generation of Global Health Leadership',
          'Dr. Katie Boston-Leary, American Nurses Enterprise · Dr. Stacy Bentil, Bentil Leadership Institute',
        ],
      },
      {
        time: '5:00 PM',
        title: 'Day 1 Wrap-Up & Evening Free',
        format: 'Close',
        details: ['Optional informal networking dinners'],
      },
    ],
  },
  {
    id: 'day2',
    label: 'Day Two',
    dateLabel: 'Saturday, August 22, 2026',
    sessions: [
      {
        time: '7:30 AM',
        title: 'Morning Networking Breakfast & Visit Exhibits',
        format: 'Networking',
      },
      {
        time: '8:00 AM',
        title:
          'Controlling Hypertension in African Descent Populations: Local and Global Perspectives',
        format: 'Keynote',
        details: [
          'Dr. George Mensah, National Heart, Lung, and Blood Institute, National Institutes of Health',
        ],
      },
      {
        time: '8:30 AM – 9:30 AM',
        title: 'Featured Panel — Innovative Strategies to Control Hypertension Across the Diaspora',
        format: 'Panel',
        details: [
          'Moderator',
          '— Dr. Eunice Cromwell, Healthcare Leader, Director of Community & Member Engagement, A-DNA USA',
          'Panelists',
          '— Dr. Lisa Cooper, Director, Johns Hopkins Center for Health Equity, Bloomberg Distinguished Professor, Johns Hopkins Schools of Nursing, Medicine and Public Health',
          '— Dr. Serina Gbaba, Cardiovascular Nurse Practitioner, Meritus Health, Co-Director of Education, Ghanaian-Diaspora Nursing Alliance',
          '— Dr. Bunmi Ogungbe, Assistant Professor, Johns Hopkins Schools of Nursing and Public Health',
          '— Dr. Levette Owusu-Ansah, Interim National President, Ghana Pharmacist Association – North America',
        ],
      },
      {
        time: '9:45 AM – 10:45 AM',
        title:
          'Transitional Care Panel — Bridging the Gap: Advancing Transitional Care Across the Continuum',
        format: 'Panel',
        details: [
          'Panelists',
          '— Dr. Danah Jack, DPT, Principal, Metro Health & Rehab',
          '— Dr. Sid Patel, Wellrock Pharmacy',
          '— Natoe Goba, NP, Aveon Health Services',
          '— Cynthia Jones-Quartey, RN, Nascent Community Healthcare Network',
        ],
      },
      {
        time: '11:00 AM – 3:00 PM',
        title: 'Community Health Fair',
        format: 'Health Fair',
        details: [
          'Host  Redeemers Church of Christ',
          'Location  10001 Aerospace Rd, Lanham, MD 20706',
        ],
      },
      {
        time: '5:00 PM – 8:30 PM',
        title: 'A-DNA Fundraising Reception',
        format: 'Reception',
        details: [
          "An elegant evening celebrating excellence in African diaspora health — featuring dinner, awards, and opportunities to invest in A-DNA's global mission.",
          'Keynote  Dr. Kofi Boahene, Professor of Otolaryngology–Head and Neck Surgery and Dermatology; Founder, West Africa Institute for Special Surgery (WAISS)',
        ],
      },
    ],
  },
]
