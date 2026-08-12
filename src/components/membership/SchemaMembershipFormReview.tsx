import type { MembershipFormSchema } from '../../lib/adnaMembershipApi'
import {
  fieldsForStep,
  inputSteps,
  isFieldVisible,
  type DynamicFormValues,
} from '../../lib/membershipFormDynamic'
import { phoneCodeLabelForIso } from '../../data/phoneCodeOptions'

type Props = {
  schema: MembershipFormSchema
  values: DynamicFormValues
  onEdit: (step: number) => void
  submitError: string | null
  submitting: boolean
}

function formatValue(fieldKey: string, value: unknown, values: DynamicFormValues): string {
  if (fieldKey === 'password' || fieldKey === 'confirmPassword') return '••••••••'
  if (fieldKey === 'isStudent')
    return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : String(value ?? '')
  if (fieldKey === 'phone') {
    return [phoneCodeLabelForIso(String(values.phoneCode ?? '')), String(value ?? '')]
      .filter(Boolean)
      .join(' · ')
  }
  if (fieldKey === 'showSpeciality') return ''
  if (Array.isArray(value)) {
    const items = [...value]
    if (
      fieldKey === 'licences' &&
      values.showSpeciality &&
      String(values.licenceSpeciality ?? '').trim()
    ) {
      items.push(`Speciality: ${String(values.licenceSpeciality).trim()}`)
    }
    return items.join(', ')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value ?? '')
}

export function SchemaMembershipFormReview({
  schema,
  values,
  onEdit,
  submitError,
  submitting,
}: Props) {
  const steps = inputSteps(schema)

  return (
    <div className="form-step mem-form-review" data-testid="membership-form-review">
      <h3>Review &amp; Submit</h3>
      <p>
        Please review your information. When you continue, your application will be saved and
        you&apos;ll complete membership payment securely on Zeffy. Use the same email on Zeffy as
        shown below.
      </p>

      <div className="mem-form-review__sections">
        {steps.map((step) => {
          const rows = fieldsForStep(schema, step.number)
            .filter((field) => isFieldVisible(field, values))
            .filter((field) => field.key !== 'confirmPassword' && field.key !== 'showSpeciality')
            .filter((field) => field.key !== 'phoneCode')
            .filter((field) => field.key !== 'licenceSpeciality')
            .map((field) => ({
              label: field.label,
              value: formatValue(field.key, values[field.key], values),
            }))
            .filter((row) => row.value !== '')

          return (
            <section key={step.number} className="mem-form-review__section">
              <div className="mem-form-review__section-head">
                <h4>{step.title}</h4>
                <button
                  type="button"
                  className="mem-form-review__edit"
                  data-testid={`review-edit-step-${step.number}`}
                  onClick={() => onEdit(step.number)}
                >
                  Edit
                </button>
              </div>
              <dl className="mem-form-review__rows">
                {rows.map((row) => (
                  <div key={row.label} className="mem-form-review__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
      </div>

      {submitError ? (
        <p role="alert" style={{ color: '#cc0000', marginTop: '1rem' }}>
          {submitError}
        </p>
      ) : null}

      <div
        className="mem-form-step-actions mem-form-step-actions--end"
        style={{ marginTop: '1.5rem' }}
      >
        <button
          type="submit"
          className="mem-form-btn mem-form-btn--primary"
          data-testid="membership-form-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Continue to payment'}
        </button>
      </div>
    </div>
  )
}
