import { useState, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm, Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { COUNTRIES, COUNTRY_PHONE_CODES, STATE_DATA } from '../data/countries'
import {
  membershipFormDefaults,
  membershipFormSchema,
  STEP_FIELDS,
  type MembershipFormValues,
} from '../lib/membershipFormSchema'
import {
  submitMembershipApplication,
  DuplicateMemberEmailError,
} from '../lib/submitMembershipApplication'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'
import { MembershipFormStepper } from './MembershipFormStepper'
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

function RequiredMark() {
  return <span className="mem-form-required"> *</span>
}

function getFirstErrorMessage(
  errors: FieldErrors<MembershipFormValues>,
  fields: readonly (keyof MembershipFormValues)[],
): string | undefined {
  for (const field of fields) {
    const message = errors[field]?.message
    if (message) return String(message)
  }
}

function findFirstStepWithError(
  fieldErrors: FieldErrors<MembershipFormValues>,
): keyof typeof STEP_FIELDS | null {
  for (const stepNumber of [1, 2, 3, 4] as const) {
    if (getFirstErrorMessage(fieldErrors, STEP_FIELDS[stepNumber])) return stepNumber
  }
  return null
}

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p style={errorTextStyle}>{message}</p>
}

function DuplicateEmailAlert() {
  return (
    <div
      role="alert"
      style={{
        marginTop: '0.75rem',
        padding: '12px 14px',
        borderRadius: 8,
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        fontSize: '0.9rem',
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0 }}>
        An account with this email already exists. Please{' '}
        <Link
          to={PORTAL_LOGIN_PATH}
          style={{ color: '#0D3D2B', fontWeight: 700, textDecoration: 'underline' }}
        >
          sign in to the Member Portal
        </Link>{' '}
        instead, or use a different email address.
      </p>
    </div>
  )
}

function StateField({
  country,
  value,
  name,
  onChange,
  onBlur,
  error,
}: {
  country: string
  value: string
  name: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
}) {
  const data = STATE_DATA[country]
  if (!country) return null

  const handleChange = (nextValue: string) => {
    onChange(nextValue)
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <label style={labelStyle}>
        {data?.label ?? 'State / Province / Region'}
        <RequiredMark />
      </label>
      {data ? (
        <select
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={(e) => handleChange(e.target.value)}
          style={{ ...fieldStyle(!!error), background: '#fff' }}
        >
          <option value="">-- Select --</option>
          {data.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={(e) => handleChange(e.target.value)}
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
  const [duplicateEmail, setDuplicateEmail] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    getFieldState,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: membershipFormDefaults,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const registerField = (
    name: keyof MembershipFormValues,
    options?: Parameters<UseFormRegister<MembershipFormValues>>[1],
  ) => {
    const { onChange, ...rest } = register(name, options)
    return {
      ...rest,
      onChange: (event: Parameters<NonNullable<typeof onChange>>[0]) => {
        void onChange(event)
        void trigger(name)
      },
    }
  }

  const showSpeciality = watch('showSpeciality')
  const countryResidence = watch('countryResidence')
  const countryPractice = watch('countryPractice')
  const licences = watch('licences')
  const specialties = watch('specialties')

  const markComplete = (s: number) => {
    if (!completed.includes(s)) setCompleted((prev) => [...prev, s])
  }

  const goToStep = (target: number) => {
    if (target === step || target < step) setStep(target)
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
    const invalidStep = findFirstStepWithError(fieldErrors)
    if (invalidStep) {
      setStep(invalidStep)
      scrollToForm()
      toast.error(
        getFirstErrorMessage(fieldErrors, STEP_FIELDS[invalidStep]) ??
          'Please complete all required fields.',
      )
      return
    }
    toast.error('Please complete all required fields.')
  }

  const onSubmit = async (data: MembershipFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    setDuplicateEmail(false)

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
      if (error instanceof DuplicateMemberEmailError) {
        setDuplicateEmail(true)
        setStep(1)
        setCompleted((prev) => prev.filter((n) => n !== 1))
        scrollToForm()
        toast.error('An account with this email already exists.')
        window.setTimeout(() => {
          document.getElementById('membership-email')?.focus()
        }, 150)
        return
      }
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
      className="mem-pad mem-form-section"
      style={{ background: '#f9fafb', paddingTop: '2rem' }}
    >
      <div className="mem-inner">
        <div className="mem-form-intro">
          <h2 className="font-heading mem-form-intro__title">Register</h2>
          <p className="mem-form-intro__subtitle">Fill in your membership application below.</p>
        </div>

        <div className="mem-form-card">
          <MembershipFormStepper step={step} completed={completed} onGoToStep={goToStep} />

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mem-form-body">
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
                    Title
                    <RequiredMark />
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
                        <input type="radio" value={t} {...registerField('title')} />{' '}
                        {t === 'Dr' ? 'Dr.' : t}
                      </label>
                    ))}
                  </div>
                  <FieldError message={errors.title?.message} />
                </div>

                <div className="mem-form-name-grid" style={{ marginBottom: '1rem' }}>
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
                        {f.label}
                        {f.required ? (
                          <RequiredMark />
                        ) : (
                          <span className="mem-form-optional"> (Optional)</span>
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
                    Country of Residence
                    <RequiredMark />
                  </label>
                  <select
                    style={{ ...fieldStyle(!!errors.countryResidence), background: '#fff' }}
                    {...registerField('countryResidence', {
                      onChange: (event) => {
                        const country = event.target.value
                        setValue('stateResidence', '', { shouldValidate: false, shouldDirty: true })
                        const phoneCode = COUNTRY_PHONE_CODES[country as (typeof COUNTRIES)[number]]
                        if (phoneCode) setValue('phoneCode', phoneCode)
                      },
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
                        key={countryResidence}
                        country={countryResidence}
                        name={field.name}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(value) => {
                          field.onChange(value)
                          void trigger('stateResidence')
                        }}
                        error={errors.stateResidence?.message}
                      />
                    )}
                  />
                </div>

                <div className="mem-form-phone-grid" style={{ marginBottom: '1rem' }}>
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
                      Phone / Mobile
                      <RequiredMark />
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
                    Email
                    <RequiredMark />
                  </label>
                  <input
                    id="membership-email"
                    type="email"
                    placeholder="your@email.com"
                    style={fieldStyle(!!errors.email || duplicateEmail)}
                    {...register('email', {
                      onChange: () => setDuplicateEmail(false),
                    })}
                  />
                  <FieldError message={errors.email?.message} />
                  {duplicateEmail && <DuplicateEmailAlert />}
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
                        <input type="radio" value={v} {...registerField('isStudent')} />{' '}
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
                    {...registerField('education')}
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
                      <input
                        type="checkbox"
                        {...registerField('showSpeciality', {
                          onChange: (event) => {
                            if (!event.target.checked) {
                              setValue('licenceSpeciality', '', { shouldValidate: false })
                              clearErrors('licenceSpeciality')
                            }
                          },
                        })}
                      />{' '}
                      Specify Speciality Nurse
                    </label>
                  </div>
                  <FieldError message={errors.licences?.message} />
                  {showSpeciality && (
                    <>
                      <input
                        type="text"
                        placeholder="Specify speciality"
                        style={{ ...fieldStyle(!!errors.licenceSpeciality), marginTop: '0.5rem' }}
                        {...registerField('licenceSpeciality')}
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
                    {...registerField('countryPractice', {
                      onChange: () =>
                        setValue('statePractice', '', { shouldValidate: false, shouldDirty: true }),
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
                        key={countryPractice}
                        country={countryPractice}
                        name={field.name}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(value) => {
                          field.onChange(value)
                          void trigger('statePractice')
                        }}
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
                    {...registerField('licenceStatus')}
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
                        <input type="radio" value={e} {...registerField('employmentStatus')} /> {e}
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
                    {...registerField('positionTitle')}
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
                    {...registerField('practiceSetting')}
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
                    {...registerField('membershipType')}
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
    </div>
  )
}
