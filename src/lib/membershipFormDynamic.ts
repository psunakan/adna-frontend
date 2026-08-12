import { z } from 'zod'
import { isValidMemberPhone } from './phoneNumber'
import {
  fetchMembershipFormSchema,
  isAdnaApiConfigured,
  type MembershipFormField,
  type MembershipFormSchema,
  type MembershipFormStep,
} from './adnaMembershipApi'

export type DynamicFormValues = Record<string, unknown>

export function defaultValueForField(field: MembershipFormField): unknown {
  if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
    return field.defaultValue
  }
  switch (field.type) {
    case 'checkbox_group':
      return []
    case 'checkbox':
      return false
    default:
      if (field.key === 'phoneCode') return 'US'
      return ''
  }
}

export function buildFormDefaults(schema: MembershipFormSchema): DynamicFormValues {
  const defaults: DynamicFormValues = {}
  for (const field of schema.fields) {
    defaults[field.key] = defaultValueForField(field)
  }
  return defaults
}

export function fieldsForStep(schema: MembershipFormSchema, step: number): MembershipFormField[] {
  return schema.fields
    .filter((field) => field.step === step)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function reviewStepNumber(schema: MembershipFormSchema): number {
  const review = schema.steps.find((step) => /review/i.test(step.title))
  if (review) return review.number
  const max = Math.max(...schema.steps.map((step) => step.number), 0)
  return max > 0 ? max : 5
}

export function inputSteps(schema: MembershipFormSchema): MembershipFormStep[] {
  const review = reviewStepNumber(schema)
  return schema.steps
    .filter((step) => step.number !== review)
    .sort((a, b) => a.number - b.number)
}

function isEmpty(value: unknown, type: MembershipFormField['type']): boolean {
  if (type === 'checkbox_group') return !Array.isArray(value) || value.length === 0
  if (type === 'checkbox') return false
  return value === undefined || value === null || value === ''
}

function conditionMet(actual: unknown, expected: unknown): boolean {
  if (typeof expected === 'boolean') {
    const truthy =
      actual === true || actual === 1 || actual === '1' || actual === 'true' || actual === 'yes'
    return expected ? truthy : !truthy
  }
  return String(actual ?? '') === String(expected ?? '')
}

export function isFieldVisible(field: MembershipFormField, values: DynamicFormValues): boolean {
  const showWhen = field.config?.showWhen
  if (!showWhen?.field) return true
  return conditionMet(values[showWhen.field], showWhen.value)
}

function optionValues(field: MembershipFormField): string[] {
  return (field.options ?? []).map((option) => option.value)
}

export function buildZodSchema(schema: MembershipFormSchema) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of schema.fields) {
    if (field.type === 'checkbox_group') {
      shape[field.key] = z.array(z.string())
    } else if (field.type === 'checkbox') {
      shape[field.key] = z.boolean()
    } else {
      shape[field.key] = z.string()
    }
  }

  return z.object(shape).superRefine((data, ctx) => {
    for (const field of schema.fields) {
      if (!isFieldVisible(field, data)) continue

      const value = data[field.key]
      const required =
        field.required ||
        (field.key === 'licenceSpeciality' && conditionMet(data.showSpeciality, true))

      if (required && isEmpty(value, field.type)) {
        ctx.addIssue({
          code: 'custom',
          message: `${field.label} is required.`,
          path: [field.key],
        })
        continue
      }

      if (isEmpty(value, field.type)) continue

      const validation = field.validation ?? {}

      if (
        (field.type === 'email' || validation.format === 'email') &&
        typeof value === 'string' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter a valid email address.',
          path: [field.key],
        })
      }

      if (
        typeof validation.minLength === 'number' &&
        typeof value === 'string' &&
        value.length < validation.minLength
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `${field.label} must be at least ${validation.minLength} characters.`,
          path: [field.key],
        })
      }

      if (validation.matchField && typeof value === 'string') {
        const other = String(data[validation.matchField] ?? '')
        if (value !== other) {
          ctx.addIssue({
            code: 'custom',
            message: 'Passwords do not match.',
            path: [field.key],
          })
        }
      }

      if (
        typeof validation.minSelections === 'number' &&
        Array.isArray(value) &&
        value.length < validation.minSelections
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Please select at least one option for ${field.label}.`,
          path: [field.key],
        })
      }

      const allowed = optionValues(field)
      if (
        allowed.length > 0 &&
        ['select', 'radio', 'searchable_select'].includes(field.type) &&
        typeof value === 'string' &&
        !allowed.includes(value)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Please select a valid ${field.label.toLowerCase()}.`,
          path: [field.key],
        })
      }

      if (field.type === 'membership_type' && typeof value === 'string') {
        const aliases = optionValues(field)
        if (aliases.length > 0 && !aliases.includes(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Please select a membership type.',
            path: [field.key],
          })
        }
      }
    }

    const phone = typeof data.phone === 'string' ? data.phone : ''
    const phoneCode = typeof data.phoneCode === 'string' ? data.phoneCode : ''
    const countryResidence =
      typeof data.countryResidence === 'string' ? data.countryResidence : ''
    if (
      phone &&
      phoneCode &&
      countryResidence &&
      !isValidMemberPhone(phone, phoneCode, countryResidence)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid phone number for the selected country code.',
        path: ['phone'],
      })
    }
  })
}

export async function loadMembershipFormSchema(): Promise<MembershipFormSchema> {
  if (isAdnaApiConfigured) {
    try {
      return await fetchMembershipFormSchema()
    } catch (error) {
      console.warn('Falling back to local membership form schema.', error)
    }
  }
  return getLocalMembershipFormSchema()
}

const opt = (values: string[]) => values.map((value) => ({ value, label: value }))

/** Local fallback matching the historical hardcoded form (keeps e2e green without WP). */
export function getLocalMembershipFormSchema(): MembershipFormSchema {
  return {
    version: 'local',
    steps: [
      { number: 1, title: 'Personal Information', description: 'Account and contact details' },
      { number: 2, title: 'Professional Information', description: 'Licenses and practice location' },
      {
        number: 3,
        title: 'Professional Information Cont.',
        description: 'Employment and specialties',
      },
      { number: 4, title: 'Membership Type', description: 'Choose your paid membership tier' },
      { number: 5, title: 'Review', description: 'Confirm your application' },
    ],
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'radio',
        step: 1,
        sortOrder: 10,
        required: true,
        options: [
          { value: 'Ms', label: 'Ms' },
          { value: 'Mr', label: 'Mr' },
          { value: 'Dr', label: 'Dr.' },
          { value: 'Mrs', label: 'Mrs' },
        ],
      },
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        step: 1,
        sortOrder: 20,
        required: true,
        placeholder: 'First name',
        width: 'half',
      },
      {
        key: 'middleName',
        label: 'Middle Name',
        type: 'text',
        step: 1,
        sortOrder: 30,
        required: false,
        placeholder: 'Middle name',
        width: 'half',
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        step: 1,
        sortOrder: 40,
        required: true,
        placeholder: 'Last name',
        width: 'half',
      },
      {
        key: 'countryResidence',
        label: 'Country of Residence',
        type: 'country',
        step: 1,
        sortOrder: 50,
        required: true,
      },
      {
        key: 'stateResidence',
        label: 'State / province / region',
        type: 'state',
        step: 1,
        sortOrder: 60,
        required: true,
        config: { countryField: 'countryResidence' },
      },
      {
        key: 'phoneCode',
        label: 'Phone country',
        type: 'select',
        step: 1,
        sortOrder: 70,
        required: true,
        defaultValue: 'US',
        width: 'half',
      },
      {
        key: 'phone',
        label: 'Phone number',
        type: 'tel',
        step: 1,
        sortOrder: 80,
        required: true,
        placeholder: 'Phone number',
        width: 'half',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        step: 1,
        sortOrder: 90,
        required: true,
        placeholder: 'your@email.com',
        validation: { format: 'email' },
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        step: 1,
        sortOrder: 100,
        required: true,
        width: 'half',
        validation: { minLength: 8 },
      },
      {
        key: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        step: 1,
        sortOrder: 110,
        required: true,
        width: 'half',
        validation: { matchField: 'password' },
      },
      {
        key: 'isStudent',
        label: 'Are you a student?',
        type: 'yes_no',
        step: 2,
        sortOrder: 10,
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        key: 'education',
        label: 'Highest level of education',
        type: 'select',
        step: 2,
        sortOrder: 20,
        required: true,
        options: opt(['Diploma', 'Bachelors', 'Masters', 'DNP', 'PhD', 'Other']),
      },
      {
        key: 'licences',
        label: 'Nurse license(s) held',
        type: 'checkbox_group',
        step: 2,
        sortOrder: 30,
        required: true,
        options: opt([
          'Not Applicable',
          'Registered Nurse',
          'Registered Midwife',
          'Diploma Nurse',
        ]),
        validation: { minSelections: 1 },
      },
      {
        key: 'showSpeciality',
        label: 'Specify Speciality Nurse',
        type: 'checkbox',
        step: 2,
        sortOrder: 40,
        required: false,
        defaultValue: false,
      },
      {
        key: 'licenceSpeciality',
        label: 'Speciality nurse license',
        type: 'text',
        step: 2,
        sortOrder: 50,
        required: false,
        placeholder: 'Specify speciality',
        config: { showWhen: { field: 'showSpeciality', value: true } },
      },
      {
        key: 'countryPractice',
        label: 'Country of practice',
        type: 'country',
        step: 2,
        sortOrder: 60,
        required: true,
      },
      {
        key: 'statePractice',
        label: 'Practice state / province / region',
        type: 'state',
        step: 2,
        sortOrder: 70,
        required: true,
        config: { countryField: 'countryPractice' },
      },
      {
        key: 'licenceStatus',
        label: 'License status',
        type: 'select',
        step: 2,
        sortOrder: 80,
        required: true,
        options: opt(['Active', 'InActive', 'Not Applicable']),
      },
      {
        key: 'nursingEducation',
        label: 'Where did you receive your entry-level nursing education?',
        type: 'country',
        step: 3,
        sortOrder: 10,
        required: true,
      },
      {
        key: 'employmentStatus',
        label: 'Employment status',
        type: 'radio',
        step: 3,
        sortOrder: 20,
        required: true,
        options: opt(['Full-time', 'Part-time', 'Per-diem', 'Retired', 'Unemployed']),
      },
      {
        key: 'specialties',
        label: 'Specialty (select all that apply)',
        type: 'checkbox_group',
        step: 3,
        sortOrder: 30,
        required: true,
        options: opt([
          'Acute Care',
          'Adult Health',
          'Cardiology',
          'Community',
          'Critical Care',
          'Family Health',
          'Geriatric',
          'Home Health',
          'Medical Surgical',
          'Neonatal',
          'Pediatrics',
          'Primary Care',
          'Public Health',
          'Research',
          "Women's Health",
          'Other',
        ]),
        validation: { minSelections: 1 },
      },
      {
        key: 'positionTitle',
        label: 'Position title',
        type: 'select',
        step: 3,
        sortOrder: 40,
        required: true,
        options: opt([
          'Staff Nurse',
          'Advance Practice Registered Nurse',
          'Case Manager',
          'Consultant',
          'Nurse Manager',
          'Nurse Researcher',
          'Nurse Executive',
          'Nurse Faculty / Educator',
          'Other-Health Related',
          'Other-Non Health Related',
        ]),
      },
      {
        key: 'practiceSetting',
        label: 'Practice setting',
        type: 'select',
        step: 3,
        sortOrder: 50,
        required: true,
        options: opt([
          'Hospital',
          'Nursing Home / Extended Care',
          'Assisted Living',
          'School of Nursing',
          'Community Health',
          'Dialysis Center',
          'Policy / Planning / Regulatory / Licensing',
          'Agency',
          'Clinic',
          'Urgent Care',
          'Government',
        ]),
      },
      {
        key: 'membershipType',
        label: 'Membership',
        type: 'membership_type',
        step: 4,
        sortOrder: 10,
        required: true,
        options: [
          { value: 'premium', label: 'Premium Membership ($150)', amount: 150 },
          { value: 'diaspora', label: 'Diaspora Membership ($75)', amount: 75 },
        ],
        config: { paidOnly: true },
      },
    ],
  }
}
