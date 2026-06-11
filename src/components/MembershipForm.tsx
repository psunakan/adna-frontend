import { useState, type CSSProperties } from 'react'
import { useForm, Controller, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { COUNTRIES, STATE_DATA } from '../data/countries'
import {
  membershipFormDefaults,
  membershipFormSchema,
  STEP_FIELDS,
  type MembershipFormValues,
} from '../lib/membershipFormSchema'
import { submitMembershipApplication } from '../lib/submitMembershipApplication'
import type { MembershipType } from '../types/database'

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: '1rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const labelStyle: CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: '0.4rem',
}

const errorTextStyle: CSSProperties = {
  color: '#cc0000',
  fontSize: '0.8rem',
  marginTop: '0.35rem',
}

const STEPS = ['Personal Info', 'Professional Info', 'Prof. Info Cont.', 'Membership Type'] as const

function getFirstErrorMessage(
  errors: FieldErrors<MembershipFormValues>,
  fields: readonly (keyof MembershipFormValues)[],
): string | undefined {
  for (const field of fields) {
    const message = errors[field]?.message
    if (message) return String(message)
  }
}

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p style={errorTextStyle}>{message}</p>
}

function StateField({
  country,
  value,
  onChange,
  error,
}: {
  country: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const data = STATE_DATA[country]
  if (!country) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <label style={labelStyle}>{data?.label ?? 'State / Province / Region'}</label>
      {data ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...fieldStyle(!!error), background: '#fff' }}
        >
          <option value="">-- Select --</option>
          {data.options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="State / Province / Region"
          style={fieldStyle(!!error)}
        />
      )}
      <FieldError message={error} />
    </div>
  )
}

export function MembershipForm() {
  const [step, setStep] = useState(1)
  const [completed, setCompleted] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    getFieldState,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: membershipFormDefaults,
    mode: 'onTouched',
  })

  const showSpeciality = watch('showSpeciality')
  const countryResidence = watch('countryResidence')
  const countryPractice = watch('countryPractice')
  const licences = watch('licences')
  const specialties = watch('specialties')

  const markComplete = (s: number) => {
    if (!completed.includes(s)) setCompleted((prev) => [...prev, s])
  }

  const goToStep = (target: number) => {
    if (completed.includes(target) || target === step) setStep(target)
  }

  const scrollToForm = () => {
    document
      .getElementById('membership-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showStepErrors = (stepNumber: keyof typeof STEP_FIELDS) => {
    const fields = STEP_FIELDS[stepNumber]
    for (const field of fields) {
      const { error } = getFieldState(field)
      if (error?.message) {
        toast.error(error.message)
        return
      }
    }
    toast.error(getFirstErrorMessage(errors, fields) ?? 'Please complete all required fields.')
  }

  const next = async (from: keyof typeof STEP_FIELDS) => {
    const valid = await trigger([...STEP_FIELDS[from]])
    if (!valid) {
      showStepErrors(from)
      return
    }

    markComplete(from)
    setStep(from + 1)
    scrollToForm()
  }

  const prev = (from: number) => {
    setStep(from - 1)
    scrollToForm()
  }

  const toggleArrayValue = (field: 'licences' | 'specialties', value: string) => {
    const current = getValues(field)
    setValue(
      field,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      {
        shouldValidate: true,
      },
    )
  }

  const onInvalid = (fieldErrors: FieldErrors<MembershipFormValues>) => {
    toast.error(
      getFirstErrorMessage(fieldErrors, STEP_FIELDS[4]) ?? 'Please complete all required fields.',
    )
  }

  const onSubmit = async (data: MembershipFormValues) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitMembershipApplication({
        title: data.title,
        first_name: data.firstName,
        middle_name: data.middleName,
        last_name: data.lastName,
        country_residence: data.countryResidence,
        state_residence: data.stateResidence,
        phone_code: data.phoneCode,
        phone: data.phone,
        email: data.email,
        is_student: data.isStudent === 'yes',
        education: data.education,
        licences: data.licences,
        licence_speciality: data.licenceSpeciality,
        country_practice: data.countryPractice,
        state_practice: data.statePractice,
        licence_status: data.licenceStatus,
        nursing_education: data.nursingEducation,
        employment_status: data.employmentStatus,
        specialties: data.specialties,
        position_title: data.positionTitle,
        practice_setting: data.practiceSetting,
        membership_type: data.membershipType as MembershipType,
      })
      toast.success('Application submitted successfully!')
      setSubmitted(true)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Submission failed. Please try again.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        id="membership-form"
        className="mem-pad"
        style={{ background: '#f9fafb', paddingTop: '2rem' }}
      >
        <div className="mem-inner text-center" style={{ padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3
            className="font-heading"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0D3D2B',
              marginBottom: '0.75rem',
            }}
          >
            Thank you for registering!
          </h3>
          <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7 }}>
            We have received your membership application.
            <br />A confirmation email has been sent to your inbox.
            <br />
            We will be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      id="membership-form"
      className="mem-pad"
      style={{ background: '#f9fafb', paddingTop: '2rem' }}
    >
      <div className="mem-inner">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2
            className="font-heading font-black tracking-widest uppercase text-4xl"
            style={{ color: '#0a3d2e' }}
          >
            Register
          </h2>
          <p
            style={{ color: '#334155', fontSize: '1.05rem', fontWeight: 400, marginTop: '0.5rem' }}
          >
            Fill in your Membership Form
          </p>
        </div>

        <div
          id="form-steps"
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: 0,
            marginBottom: '2rem',
            borderBottom: '2px solid #e5e7eb',
            whiteSpace: 'nowrap',
          }}
        >
          {STEPS.map((label, i) => {
            const n = i + 1
            const isActive = step === n
            const isDone = completed.includes(n)
            return (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(n)}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isActive || isDone ? '#0D3D2B' : '#9ca3af',
                  borderBottom: isActive || isDone ? '3px solid #0D3D2B' : '3px solid transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isActive || isDone ? '#0D3D2B' : '#e5e7eb',
                    color: isActive || isDone ? '#fff' : '#6b7280',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  {isDone && !isActive ? '✓' : n}
                </span>
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, marginBottom: '2rem' }}>
          <div
            style={{
              background: '#0D3D2B',
              borderRadius: 999,
              height: 6,
              width: `${(step / 4) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {step === 1 && (
            <div className="form-step">
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0D3D2B',
                  marginBottom: '0.25rem',
                }}
              >
                Personal Information
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Fields marked <span style={{ color: '#cc0000' }}>*</span> are required.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Title <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {['Ms', 'Mr', 'Dr', 'Mrs'].map((t) => (
                    <label
                      key={t}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input type="radio" value={t} {...register('title')} />{' '}
                      {t === 'Dr' ? 'Dr.' : t}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.title?.message} />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                {[
                  {
                    name: 'firstName' as const,
                    label: 'First Name',
                    required: true,
                    placeholder: 'First name',
                  },
                  {
                    name: 'middleName' as const,
                    label: 'Middle Name',
                    required: false,
                    placeholder: 'Middle name',
                  },
                  {
                    name: 'lastName' as const,
                    label: 'Last Name',
                    required: true,
                    placeholder: 'Last name',
                  },
                ].map((f) => (
                  <div key={f.name}>
                    <label style={labelStyle}>
                      {f.label}{' '}
                      {f.required ? (
                        <span style={{ color: '#cc0000' }}>*</span>
                      ) : (
                        <span style={{ color: '#6b7280', fontWeight: 400 }}>(Optional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      style={fieldStyle(!!errors[f.name])}
                      {...register(f.name)}
                    />
                    <FieldError message={errors[f.name]?.message} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  Country of Residence <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.countryResidence), background: '#fff' }}
                  {...register('countryResidence', {
                    onChange: () => setValue('stateResidence', '', { shouldValidate: true }),
                  })}
                >
                  <option value="">-- Select country --</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.countryResidence?.message} />
                <Controller
                  name="stateResidence"
                  control={control}
                  render={({ field }) => (
                    <StateField
                      country={countryResidence}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.stateResidence?.message}
                    />
                  )}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label style={labelStyle}>Country Code</label>
                  <select
                    style={{ ...inputStyle, background: '#fff', fontSize: '0.95rem' }}
                    {...register('phoneCode')}
                  >
                    <option value="+1">US +1</option>
                    <option value="+44">UK +44</option>
                    <option value="+233">GH +233</option>
                    <option value="+234">NG +234</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Phone / Mobile <span style={{ color: '#cc0000' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    style={fieldStyle(!!errors.phone)}
                    {...register('phone')}
                  />
                  <FieldError message={errors.phone?.message} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>
                  Email <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={fieldStyle(!!errors.email)}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => next(1)}
                  style={{
                    background: '#0D3D2B',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0D3D2B',
                  marginBottom: '1.5rem',
                }}
              >
                Professional Information
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Are you a student? <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {(['yes', 'no'] as const).map((v) => (
                    <label
                      key={v}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <input type="radio" value={v} {...register('isStudent')} />{' '}
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.isStudent?.message} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  Highest level of education <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.education), background: '#fff' }}
                  {...register('education')}
                >
                  <option value="">-Select-</option>
                  {['Diploma', 'Bachelors', 'Masters', 'DNP', 'PhD', 'Other'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.education?.message} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Nurse license(s) held <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Not Applicable',
                    'Registered Nurse',
                    'Registered Midwife',
                    'Diploma Nurse',
                  ].map((l) => (
                    <label
                      key={l}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={licences.includes(l)}
                        onChange={() => toggleArrayValue('licences', l)}
                      />{' '}
                      {l}
                    </label>
                  ))}
                  <label
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <input type="checkbox" {...register('showSpeciality')} /> Specify Speciality
                    Nurse
                  </label>
                </div>
                <FieldError message={errors.licences?.message} />
                {showSpeciality && (
                  <>
                    <input
                      type="text"
                      placeholder="Specify speciality"
                      style={{ ...fieldStyle(!!errors.licenceSpeciality), marginTop: '0.5rem' }}
                      {...register('licenceSpeciality')}
                    />
                    <FieldError message={errors.licenceSpeciality?.message} />
                  </>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  Country of practice <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.countryPractice), background: '#fff' }}
                  {...register('countryPractice', {
                    onChange: () => setValue('statePractice', '', { shouldValidate: true }),
                  })}
                >
                  <option value="">-- Select country --</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.countryPractice?.message} />
                <Controller
                  name="statePractice"
                  control={control}
                  render={({ field }) => (
                    <StateField
                      country={countryPractice}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.statePractice?.message}
                    />
                  )}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>
                  License status <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.licenceStatus), background: '#fff' }}
                  {...register('licenceStatus')}
                >
                  <option value="">-Select-</option>
                  {['Active', 'InActive', 'Not Applicable'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.licenceStatus?.message} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => prev(2)}
                  style={{
                    background: '#fff',
                    color: '#0D3D2B',
                    border: '1.5px solid #0D3D2B',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={() => next(2)}
                  style={{
                    background: '#0D3D2B',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0D3D2B',
                  marginBottom: '1.5rem',
                }}
              >
                Professional Information Cont.
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  Where did you receive your entry-level nursing education?{' '}
                  <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Country / Institution"
                  style={fieldStyle(!!errors.nursingEducation)}
                  {...register('nursingEducation')}
                />
                <FieldError message={errors.nursingEducation?.message} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Employment status <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {['Full-time', 'Part-time', 'Per-diem', 'Retired', 'Unemployed'].map((e) => (
                    <label
                      key={e}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <input type="radio" value={e} {...register('employmentStatus')} /> {e}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.employmentStatus?.message} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                  Specialty (select all that apply) <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem' }}
                >
                  {[
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
                  ].map((s) => (
                    <label
                      key={s}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={specialties.includes(s)}
                        onChange={() => toggleArrayValue('specialties', s)}
                      />{' '}
                      {s}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.specialties?.message} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>
                  Position title <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.positionTitle), background: '#fff' }}
                  {...register('positionTitle')}
                >
                  <option value="">-Select-</option>
                  {[
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
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.positionTitle?.message} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>
                  Practice setting <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.practiceSetting), background: '#fff' }}
                  {...register('practiceSetting')}
                >
                  <option value="">-Select-</option>
                  {[
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
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.practiceSetting?.message} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => prev(3)}
                  style={{
                    background: '#fff',
                    color: '#0D3D2B',
                    border: '1.5px solid #0D3D2B',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  onClick={() => next(3)}
                  style={{
                    background: '#0D3D2B',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#0D3D2B',
                  marginBottom: '0.5rem',
                }}
              >
                Membership Type
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Select your membership type. <strong>Free for Regular members.</strong>
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>
                  Membership <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <select
                  style={{ ...fieldStyle(!!errors.membershipType), background: '#fff' }}
                  {...register('membershipType')}
                >
                  <option value="">-Select-</option>
                  <option value="premium">Premium Membership ($150)</option>
                  <option value="diaspora">Diaspora Membership ($75)</option>
                  <option value="regular">Regular Membership (FREE)</option>
                </select>
                <FieldError message={errors.membershipType?.message} />
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Professional &amp; Regular memberships are free for Ghana/Africa members.
                </p>
              </div>

              {submitError && (
                <p
                  role="alert"
                  style={{ color: '#cc0000', fontSize: '0.9rem', marginBottom: '1rem' }}
                >
                  {submitError}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => prev(4)}
                  disabled={submitting}
                  style={{
                    background: '#fff',
                    color: '#0D3D2B',
                    border: '1.5px solid #0D3D2B',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  &larr; Previous
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#cc0000',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: 8,
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: submitting ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
