import { z } from 'zod'

const requiredSelection = (message: string) => z.string().min(1, message)

export const membershipFormSchema = z
  .object({
    title: requiredSelection('Please select a title.').refine(
      (v) => ['Ms', 'Mr', 'Dr', 'Mrs'].includes(v),
      'Please select a title.',
    ),
    firstName: z.string().trim().min(1, 'First name is required.'),
    middleName: z.string().optional(),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    countryResidence: z.string().min(1, 'Country of residence is required.'),
    stateResidence: z.string().trim().min(1, 'State / province / region is required.'),
    phoneCode: z.string(),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required.')
      .regex(/^[\d\s\-().+]{7,20}$/, 'Please enter a valid phone number.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.'),
    isStudent: requiredSelection('Please indicate whether you are a student.').refine(
      (v) => v === 'yes' || v === 'no',
      'Please indicate whether you are a student.',
    ),
    education: z.string().min(1, 'Highest level of education is required.'),
    licences: z.array(z.string()).min(1, 'Please select at least one nurse license option.'),
    showSpeciality: z.boolean(),
    licenceSpeciality: z.string(),
    countryPractice: z.string().min(1, 'Country of practice is required.'),
    statePractice: z.string().trim().min(1, 'Practice state / province / region is required.'),
    licenceStatus: z.string().min(1, 'License status is required.'),
    nursingEducation: z.string().trim().min(1, 'Entry-level nursing education is required.'),
    employmentStatus: z.string().min(1, 'Employment status is required.'),
    specialties: z.array(z.string()).min(1, 'Please select at least one specialty.'),
    positionTitle: z.string().min(1, 'Position title is required.'),
    practiceSetting: z.string().min(1, 'Practice setting is required.'),
    membershipType: requiredSelection('Please select a membership type.').refine(
      (v) => v === 'premium' || v === 'diaspora' || v === 'regular',
      'Please select a membership type.',
    ),
  })
  .superRefine((data, ctx) => {
    if (data.showSpeciality && !data.licenceSpeciality.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify your speciality nurse license.',
        path: ['licenceSpeciality'],
      })
    }
  })

export type MembershipFormValues = z.infer<typeof membershipFormSchema>

export const membershipFormDefaults: MembershipFormValues = {
  title: '',
  firstName: '',
  middleName: '',
  lastName: '',
  countryResidence: '',
  stateResidence: '',
  phoneCode: '+1',
  phone: '',
  email: '',
  isStudent: '',
  education: '',
  licences: [],
  showSpeciality: false,
  licenceSpeciality: '',
  countryPractice: '',
  statePractice: '',
  licenceStatus: '',
  nursingEducation: '',
  employmentStatus: '',
  specialties: [],
  positionTitle: '',
  practiceSetting: '',
  membershipType: '',
}

export const STEP_FIELDS = {
  1: [
    'title',
    'firstName',
    'lastName',
    'countryResidence',
    'stateResidence',
    'phone',
    'email',
  ] as const,
  2: [
    'isStudent',
    'education',
    'licences',
    'showSpeciality',
    'licenceSpeciality',
    'countryPractice',
    'statePractice',
    'licenceStatus',
  ] as const,
  3: [
    'nursingEducation',
    'employmentStatus',
    'specialties',
    'positionTitle',
    'practiceSetting',
  ] as const,
  4: ['membershipType'] as const,
} satisfies Record<number, readonly (keyof MembershipFormValues)[]>
