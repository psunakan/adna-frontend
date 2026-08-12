import type { MembershipFormField } from '../../lib/adnaMembershipApi'

function kebab(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

/** Stable test ids expected by Playwright helpers. */
export function fieldTestId(field: MembershipFormField): string {
  const known: Record<string, string> = {
    countryResidence: 'country-residence-select',
    stateResidence: 'state-residence-select',
    phoneCode: 'phone-code-select',
    education: 'education-select',
    countryPractice: 'country-practice-select',
    statePractice: 'state-practice-select',
    licenceStatus: 'licence-status-select',
    nursingEducation: 'nursing-education-select',
    positionTitle: 'position-title-select',
    practiceSetting: 'practice-setting-select',
    membershipType: 'membership-type-select',
  }
  return known[field.key] ?? `${kebab(field.key)}-field`
}

export function fieldInputId(field: MembershipFormField): string {
  const known: Record<string, string> = {
    email: 'membership-email',
    password: 'membership-password',
    confirmPassword: 'membership-confirm-password',
    phone: 'membership-phone',
    firstName: 'membership-firstName',
    lastName: 'membership-lastName',
    middleName: 'membership-middleName',
  }
  return known[field.key] ?? `membership-${kebab(field.key)}`
}
