import { z } from 'zod'
import { isValidMemberPhone } from './phoneNumber'

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
    phoneCode: z.string().min(1, 'Country code is required.'),
    phone: z.string().trim().min(1, 'Phone number is required.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
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
    nursingEducation: z
      .string()
      .min(1, 'Please select the country of entry-level nursing education.'),
    employmentStatus: z.string().min(1, 'Employment status is required.'),
    specialties: z.array(z.string()).min(1, 'Please select at least one specialty.'),
    positionTitle: z.string().min(1, 'Position title is required.'),
    practiceSetting: z.string().min(1, 'Practice setting is required.'),
    membershipType: requiredSelection('Please select a membership type.').refine(
      (v) => v === 'premium' || v === 'diaspora',
      'Please select a membership type.',
    ),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      })
    }

    if (data.showSpeciality && !data.licenceSpeciality.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please specify your speciality nurse license.',
        path: ['licenceSpeciality'],
      })
    }

    if (
      data.phone.trim() &&
      !isValidMemberPhone(data.phone, data.phoneCode, data.countryResidence)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid phone number for the selected country code.',
        path: ['phone'],
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
  phoneCode: 'US',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
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
    'phoneCode',
    'phone',
    'email',
    'password',
    'confirmPassword',
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
