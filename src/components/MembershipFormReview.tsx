import type { MembershipFormValues } from '../lib/membershipFormSchema'
import { phoneCodeLabelForIso } from '../data/phoneCodeOptions'

type ReviewSection = {
  step: 1 | 2 | 3 | 4
  title: string
  rows: { label: string; value: string }[]
}

const MEMBERSHIP_LABELS: Record<string, string> = {
  premium: 'Premium Membership ($150)',
  diaspora: 'Diaspora Membership ($75)',
}

function formatName(data: MembershipFormValues) {
  return [data.title === 'Dr' ? 'Dr.' : data.title, data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(' ')
}

function buildReviewSections(data: MembershipFormValues): ReviewSection[] {
  const licenceRows = [...data.licences]
  if (data.showSpeciality && data.licenceSpeciality.trim()) {
    licenceRows.push(`Speciality: ${data.licenceSpeciality.trim()}`)
  }

  return [
    {
      step: 1,
      title: 'Personal Information',
      rows: [
        { label: 'Name', value: formatName(data) },
        {
          label: 'Country of residence',
          value: [data.countryResidence, data.stateResidence].filter(Boolean).join(', '),
        },
        {
          label: 'Phone',
          value: [phoneCodeLabelForIso(data.phoneCode), data.phone].filter(Boolean).join(' · '),
        },
        { label: 'Email', value: data.email },
        { label: 'Password', value: '••••••••' },
      ],
    },
    {
      step: 2,
      title: 'Professional Information',
      rows: [
        { label: 'Student', value: data.isStudent === 'yes' ? 'Yes' : 'No' },
        { label: 'Education', value: data.education },
        { label: 'Nurse license(s)', value: licenceRows.join(', ') },
        {
          label: 'Country of practice',
          value: [data.countryPractice, data.statePractice].filter(Boolean).join(', '),
        },
        { label: 'License status', value: data.licenceStatus },
      ],
    },
    {
      step: 3,
      title: 'Experience',
      rows: [
        { label: 'Entry-level nursing education', value: data.nursingEducation },
        { label: 'Employment status', value: data.employmentStatus },
        { label: 'Specialties', value: data.specialties.join(', ') },
        { label: 'Position title', value: data.positionTitle },
        { label: 'Practice setting', value: data.practiceSetting },
      ],
    },
    {
      step: 4,
      title: 'Membership Type',
      rows: [
        {
          label: 'Membership',
          value: MEMBERSHIP_LABELS[data.membershipType] ?? data.membershipType,
        },
      ],
    },
  ]
}

type Props = {
  values: MembershipFormValues
  onEdit: (step: 1 | 2 | 3 | 4) => void
  submitError: string | null
  submitting: boolean
}

export function MembershipFormReview({ values, onEdit, submitError, submitting }: Props) {
  const sections = buildReviewSections(values)

  return (
    <div className="form-step mem-form-review" data-testid="membership-form-review">
      <h3>Review &amp; Submit</h3>
      <p>
        Please review your information. When you continue, your application will be saved and
        you&apos;ll complete membership payment securely on Zeffy. Use the same email on Zeffy as
        shown below.
      </p>

      <div className="mem-form-review__sections">
        {sections.map((section) => (
          <section key={section.step} className="mem-form-review__section">
            <div className="mem-form-review__section-head">
              <h4>{section.title}</h4>
              <button
                type="button"
                className="mem-form-review__edit"
                data-testid={`review-edit-step-${section.step}`}
                onClick={() => onEdit(section.step)}
              >
                Edit
              </button>
            </div>
            <dl className="mem-form-review__rows">
              {section.rows.map((row) => (
                <div key={row.label} className="mem-form-review__row">
                  <dt>{row.label}</dt>
                  <dd>{row.value || '-'}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {submitError && (
        <p role="alert" className="mem-form-review__error">
          {submitError}
        </p>
      )}

      <div className="mem-form-review__actions">
        <button
          type="button"
          className="mem-form-btn mem-form-btn--secondary"
          disabled={submitting}
          onClick={() => onEdit(4)}
        >
          &larr; Previous
        </button>
        <button
          type="submit"
          className="mem-form-btn mem-form-btn--submit"
          disabled={submitting}
          data-testid="membership-form-submit"
        >
          {submitting ? 'Saving…' : 'Continue to payment on Zeffy'}
        </button>
      </div>
    </div>
  )
}
