import type { MembershipFormField, MembershipFormSchema } from '../../lib/adnaMembershipApi'
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

type ReviewRow = { label: string; value: string }

const NAME_KEYS = new Set(['title', 'firstName', 'middleName', 'lastName'])
const SKIP_KEYS = new Set(['confirmPassword', 'showSpeciality', 'phoneCode', 'licenceSpeciality'])

function optionLabel(field: MembershipFormField, value: unknown): string {
  if (value == null || value === '') return ''
  const match = field.options?.find((option) => option.value === String(value))
  return match?.label ?? String(value)
}

function formatName(values: DynamicFormValues): string {
  const title = String(values.title ?? '')
  return [
    title === 'Dr' ? 'Dr.' : title,
    String(values.firstName ?? '').trim(),
    String(values.middleName ?? '').trim(),
    String(values.lastName ?? '').trim(),
  ]
    .filter(Boolean)
    .join(' ')
}

function formatValue(
  field: MembershipFormField,
  value: unknown,
  values: DynamicFormValues,
): string {
  if (field.key === 'password' || field.key === 'confirmPassword') return '••••••••'
  if (field.key === 'isStudent')
    return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : String(value ?? '')
  if (field.key === 'phone') {
    return [phoneCodeLabelForIso(String(values.phoneCode ?? '')), String(value ?? '')]
      .filter(Boolean)
      .join(' · ')
  }
  if (
    field.type === 'membership_type' ||
    field.type === 'select' ||
    field.type === 'searchable_select' ||
    field.type === 'radio' ||
    field.type === 'yes_no'
  ) {
    return optionLabel(field, value)
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => {
      const match = field.options?.find((option) => option.value === String(item))
      return match?.label ?? String(item)
    })
    if (
      field.key === 'licences' &&
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

function buildRows(fields: MembershipFormField[], values: DynamicFormValues): ReviewRow[] {
  const visible = fields
    .filter((field) => isFieldVisible(field, values))
    .filter((field) => !SKIP_KEYS.has(field.key))

  const used = new Set<string>()
  const rows: ReviewRow[] = []

  const nameFields = visible.filter((field) => NAME_KEYS.has(field.key))
  if (nameFields.length > 0) {
    const name = formatName(values)
    if (name) rows.push({ label: 'Name', value: name })
    nameFields.forEach((field) => used.add(field.key))
  }

  for (const field of visible) {
    if (used.has(field.key)) continue

    if (field.type === 'country') {
      const stateField = visible.find(
        (candidate) =>
          candidate.type === 'state' &&
          (candidate.config?.countryField ?? 'countryResidence') === field.key,
      )
      const country = String(values[field.key] ?? '').trim()
      const state = stateField ? String(values[stateField.key] ?? '').trim() : ''
      const combined = [country, state].filter(Boolean).join(', ')
      if (combined) {
        rows.push({ label: field.label, value: combined })
      }
      used.add(field.key)
      if (stateField) used.add(stateField.key)
      continue
    }

    if (field.type === 'state') {
      // Paired with its country field above when present.
      const countryKey = field.config?.countryField ?? 'countryResidence'
      if (visible.some((candidate) => candidate.key === countryKey)) continue
    }

    const value = formatValue(field, values[field.key], values)
    if (value === '') continue
    rows.push({ label: field.label, value })
    used.add(field.key)
  }

  return rows
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
          const rows = buildRows(fieldsForStep(schema, step.number), values)

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
