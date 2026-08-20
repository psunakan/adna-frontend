// Agenda content transcribed verbatim from the ADNA26 conference agenda PDF
// (public/agenda.pdf, sourced from "agendav2"). Hardcoded here for the 2026 launch
// under time pressure — move this to Supabase in a later pass so future years'
// agendas can be updated without a code deploy.

export type ProgramSession = {
  time: string
  title: string
  format: string
  location?: string
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
        location: 'Lobby & Hub',
      },
      {
        time: '8:45 AM',
        title: 'Opening Remarks',
        format: 'Welcome',
        location: 'Alumni Auditorium',
        details: ['Dr. Nana Yaa Addai, US Country Director, African-Diaspora Nursing Alliance'],
      },
      {
        time: '8:50 AM',
        title: 'Welcome Remarks',
        format: 'Welcome',
        location: 'Alumni Auditorium',
        details: [
          'Dr. Nancy Reynolds, Director, Johns Hopkins School of Nursing Center for Global Initiatives, Advisor, African-Diaspora Nursing Alliance',
        ],
      },
      {
        time: '9:00 AM – 9:30 AM',
        title:
          "No Bed, No Excuse: Closing Africa's Emergency Care Gap Through Multidisciplinary Collaboration and Diaspora-Driven Innovation",
        format: 'Keynote',
        location: 'Alumni Auditorium',
        details: ['Keynote Speaker', 'Dr. Bertha Serwaa Ayi'],
      },
      {
        time: '9:30 AM – 11:00 AM',
        title:
          "No Bed, No Excuse: Closing Africa's Emergency Care Gap Through Multidisciplinary Collaboration and Diaspora-Driven Innovation",
        format: 'Panel',
        location: 'Alumni Auditorium',
        details: [
          'Moderator',
          '— Ms. Angela Agore, UK Country Director, Ghanaian-Diaspora Nursing Alliance (G-DNA)',
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
        location: 'Hub',
      },
      {
        time: '11:15 AM – 12:15 PM',
        title: 'Concurrent Breakout Sessions — Morning',
        format: 'Breakout',
        details: [
          'Choose one',
          'A   Advancing Advanced Practice: Training & Integrating APN and Specialist Roles in African Healthcare Systems — Alumni Auditorium',
          "Dr. Rita D'Aoust · Dr. Daniel Apau · Dr. Matilda Decker · Dr. Brenda Owusu · Dr. Brenda Vardon",
          'B   Status-Neutral HIV/ID Care: Practical Primary Care Strategies for Local and Global Health — Carpenter A',
          'Dr. Melonie Owusu · Trina Scott',
          'C   From Evidence to Action: Transforming Postpartum Care Globally to Save Lives — Carpenter B',
          'Dr. Janet Williams · Ann Bonti',
          'D   Accurate Blood Pressure Measurement in the Community and Clinic — N130 & N140',
          'Dr. Faith Metlock · Dr. Yvonne Commodore-Mensah',
        ],
      },
      {
        time: '12:15 PM – 1:15 PM',
        title: 'Lunch, Networking & Visit Exhibits',
        format: 'Lunch & Exhibits',
        location: 'Foyer',
      },
      {
        time: '12:30 PM – 1:15 PM',
        title: 'Poster Presentations',
        format: 'Posters',
        location: 'Hub',
      },
      {
        time: '1:15 PM – 2:00 PM',
        title: 'Oral Presentations',
        format: 'Oral Presentations',
        location: 'Alumni Auditorium',
        details: [
          'Olufunmilola Faminu — Perception of labour pain and willingness to use pain relief among pregnant women attending the antenatal clinic at UCH, Nigeria',
          'James Aryiku — "Nothing About Us Without Us": An Innovative Tri-System Model for Advancing Student Voice & Equity in Ghanaian University Mental Health Systems',
          'Anna Mensah-Nti — Effectiveness of the Myself Model: A Nurse-Led Intervention to Reduce Cultural Stigmatization Among Older Immigrants Receiving HCBS',
        ],
      },
      {
        time: '2:00 PM – 3:20 PM',
        title:
          'Translating Ethical Recruitment into Reinvestment: Innovation and Partnership Models in Global Healthcare Workforce Mobility',
        format: 'Keynote',
        sponsor: 'Sponsored by Trumerit',
        location: 'Alumni Auditorium',
        details: [
          'Opening Remarks  Ambassador Mrs. Jane Gasu Aheto, Esq., Deputy Ambassador of Ghana to the United States of America',
          'Featured Presentation  Dr. Peter Preziosi, Chief Executive Officer, Trumerit',
          'Panelists',
          '— Dr. Manjula Luthria, Senior Labor Economist, World Bank',
          '— Amber Sprengard, Vice President, Government Affairs, Health Carousel Foundation',
          '— Perpetual Ofori-Ampofo, President, Ghana Registered Nurses and Midwives Association (GRNMA)',
          '— Dr. Deborah Baker, Senior Vice President for Nursing, Johns Hopkins Health System',
          '— Melissa Ryan Kemburu, Senior Advisor, Health Resources and Services Administration (HRSA)',
        ],
      },
      {
        time: '3:30 PM',
        title: 'Concurrent Breakout Sessions — Afternoon',
        format: 'Breakout',
        details: [
          'Choose one',
          'A   Building Wealth with Purpose: Financial Literacy for Healthcare Professionals — Alumni Auditorium',
          'Moderator — Eunice Adu, Founder, Peniel Healthcare',
          'Panelists',
          '— Dr. Eugenia Caternor, Founder, Transformational Center for Weight Loss',
          '— Mr. Terry English, Founder, Vigilant Healthcare Solutions',
          '— Anna Mensah-Nti, President/CEO Access Home Care, Inc., Access Medical Institute & Technology',
          'B   Intelligence for Impact: Leveraging AI & Machine Learning to Strengthen the African Health Workforce — Carpenter A',
          'Facilitators',
          '— Dr. Thomas Osborne, Chief Medical Officer, Microsoft',
          '— James Leuthe, Scopewell Solutions',
          'C   Advocacy in Action: Healthcare Policy Training for Global Health Champions — Carpenter B',
          'Facilitators',
          '— Anne Danhoffer, Director of Partnership and Movement Building, CARE International',
          '— Adjoa Kyerematen, Chief Executive Officer, Ghana Diaspora Public Affairs Collective (GHPAC)',
          'D   Leading the Future: Health Equity, Innovation, and the Next Generation of Global Health Leadership — N130 & N140',
          '— Dr. Katie Boston-Leary, Senior VP of Equity and Engagement, American Nurses Enterprise',
          '— Dr. Stacy Bentil, Founder, Bentil Leadership Institute, Director of Leadership Development, Ghanaian-Diaspora Nursing Alliance',
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
        location: 'Hub',
      },
      {
        time: '8:00 AM',
        title:
          'Controlling Hypertension in African Descent Populations: Local and Global Perspectives',
        format: 'Keynote',
        location: 'Alumni Auditorium',
        details: [
          'Dr. George Mensah, Director, Center for Translation Research and Implementation Science (CTRIS), National Heart, Lung, and Blood Institute (NHLBI), National Institutes of Health',
        ],
      },
      {
        time: '8:30 AM – 9:30 AM',
        title: 'Featured Panel — Innovative Strategies to Control Hypertension Across the Diaspora',
        format: 'Panel',
        location: 'Alumni Auditorium',
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
        location: 'Alumni Auditorium',
        details: [
          'Moderator',
          '— Cynthia Jones-Quartey, Founder and Program Director, Nascent Community Healthcare Network',
          'Panelists',
          '— Dr. Danah Jack, Founder & CEO, Metro Health & Rehab',
          '— Dr. Sid Patel, Co-Founder, Wellrock Pharmacy',
          '— Natoe Goba, CEO & Service Director, Aveon Health Services',
        ],
      },
      {
        time: '11:00 AM – 3:00 PM',
        title: 'Community Health Fair',
        format: 'Health Fair',
        location: '10001 Aerospace Rd, Lanham, MD 20706',
        details: ['Host  Redeemers Church of Christ'],
      },
      {
        time: '5:00 PM – 8:30 PM',
        title: 'A-DNA Fundraising Reception',
        format: 'Reception',
        location: 'Hub',
        details: [
          "An elegant evening celebrating excellence in African diaspora health — featuring dinner, awards, and opportunities to invest in A-DNA's global mission.",
          'Keynote  Dr. Kofi Boahene, Professor of Otolaryngology–Head and Neck Surgery and Dermatology; Johns Hopkins Medicine, Founder, West Africa Institute for Special Surgery (WAISS)',
        ],
      },
    ],
  },
]
