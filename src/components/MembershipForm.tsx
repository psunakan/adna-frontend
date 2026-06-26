import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm, Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormTrigger } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { COUNTRIES, STATE_DATA } from '../data/countries'
import { getCountryIsoCode } from '../data/countryIsoCodes'
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
import { savePendingCheckout } from '../lib/membershipCheckout'
import {
  clearMembershipFormDraft,
  formatDraftSavedAt,
  loadMembershipFormDraft,
  saveMembershipFormDraft,
  stripSensitiveFormValues,
} from '../lib/membershipFormProgress'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'
import { MembershipFormStepper } from './MembershipFormStepper'
import { MembershipFormReview } from './MembershipFormReview'
import { PasswordField } from './form/PasswordField'
import { SearchableSelect, type SearchableSelectOption } from './form/SearchableSelect'
import { PHONE_CODE_OPTIONS } from '../data/phoneCodeOptions'

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({ value: country, label: country }))

const EDUCATION_OPTIONS = ['Diploma', 'Bachelors', 'Masters', 'DNP', 'PhD', 'Other'].map(
  (value) => ({ value, label: value }),
)

const LICENCE_STATUS_OPTIONS = ['Active', 'InActive', 'Not Applicable'].map((value) => ({
  value,
  label: value,
}))

const POSITION_TITLE_OPTIONS = [
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
].map((value) => ({ value, label: value }))

const PRACTICE_SETTING_OPTIONS = [
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
].map((value) => ({ value, label: value }))

const MEMBERSHIP_TYPE_OPTIONS = [
  { value: 'premium', label: 'Premium Membership ($150)' },
  { value: 'diaspora', label: 'Diaspora Membership ($75)' },
]

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#d1d5db',
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

type FormStep = keyof typeof STEP_FIELDS | 5

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p style={errorTextStyle}>{message}</p>
}

function FormDropdownField({
  name,
  control,
  trigger,
  options,
  placeholder,
  hasError,
  testId,
}: {
  name: keyof MembershipFormValues
  control: Control<MembershipFormValues>
  trigger: UseFormTrigger<MembershipFormValues>
  options: SearchableSelectOption[]
  placeholder: string
  hasError: boolean
  testId: string
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SearchableSelect
          name={field.name}
          value={field.value ?? ''}
          onBlur={field.onBlur}
          onChange={(value) => {
            field.onChange(value)
            void trigger(name)
          }}
          options={options}
          placeholder={placeholder}
          hasError={hasError}
          searchable={false}
          testId={testId}
        />
      )}
    />
  )
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
  testId,
}: {
  country: string
  value: string
  name: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  testId: string
}) {
  const data = STATE_DATA[country]
  if (!country) return null

  const stateOptions = (data?.options ?? []).map((option) => ({ value: option, label: option }))

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <label style={labelStyle}>
        {data?.label ?? 'State / Province / Region'}
        <RequiredMark />
      </label>
      {data ? (
        <SearchableSelect
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          options={stateOptions}
          placeholder={`Select ${data.label.toLowerCase()}`}
          searchPlaceholder={`Search ${data.label.toLowerCase()}…`}
          hasError={!!error}
          testId={testId}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onBlur={onBlur}
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
  const [step, setStep] = useState<FormStep>(1)
  const [completed, setCompleted] = useState<number[]>([])
  const [editingFromReview, setEditingFromReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const [resumedAt, setResumedAt] = useState<string | null>(null)
  const progressReadyRef = useRef(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
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

  const registerPasswordField = (name: 'password' | 'confirmPassword') => {
    const { onChange, ...rest } = register(name)
    return {
      ...rest,
      onChange: (event: Parameters<NonNullable<typeof onChange>>[0]) => {
        void onChange(event)
        void trigger(['password', 'confirmPassword'])
      },
    }
  }

  const showSpeciality = watch('showSpeciality')
  const countryResidence = watch('countryResidence')
  const countryPractice = watch('countryPractice')
  const licences = watch('licences')
  const specialties = watch('specialties')
  const formValues = watch()

  useEffect(() => {
    const draft = loadMembershipFormDraft()
    if (draft) {
      reset({
        ...membershipFormDefaults,
        ...draft.values,
        password: '',
        confirmPassword: '',
      })
      const restoredStep = Math.min(Math.max(draft.step, 1), 5)
      setStep(restoredStep as FormStep)
      setCompleted(draft.completed)
      setResumedAt(draft.savedAt)
    }
    progressReadyRef.current = true
  }, [reset])

  useEffect(() => {
    if (!progressReadyRef.current) return

    const timeout = window.setTimeout(() => {
      saveMembershipFormDraft({
        step,
        completed,
        values: stripSensitiveFormValues(getValues()),
      })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [formValues, step, completed, getValues])

  const startOver = () => {
    clearMembershipFormDraft()
    reset(membershipFormDefaults)
    setStep(1)
    setCompleted([])
    setEditingFromReview(false)
    setResumedAt(null)
    setSubmitError(null)
    setDuplicateEmail(false)
    scrollToForm()
  }

  const markComplete = (s: number) => {
    if (!completed.includes(s)) setCompleted((prev) => [...prev, s])
  }

  const goToStep = (target: number) => {
    if (target === step) return
    if (target < step) {
      if (step === 5 && target <= 4) setEditingFromReview(true)
      setStep(target as FormStep)
    }
  }

  const goToReview = () => {
    setEditingFromReview(false)
    setCompleted([1, 2, 3, 4])
    setStep(5)
    scrollToForm()
  }

  const startEditing = (target: keyof typeof STEP_FIELDS) => {
    setEditingFromReview(true)
    setStep(target)
    scrollToForm()
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
    if (from === 4) {
      goToReview()
      return
    }
    setStep((from + 1) as FormStep)
    scrollToForm()
  }

  const finishEditing = async (from: keyof typeof STEP_FIELDS) => {
    const valid = await trigger([...STEP_FIELDS[from]])
    if (!valid) {
      showStepErrors(from)
      return
    }

    markComplete(from)
    goToReview()
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
      setEditingFromReview(false)
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
      const membershipType = data.membershipType
      if (membershipType !== 'diaspora' && membershipType !== 'premium') {
        throw new Error('Please select a membership type.')
      }

      const result = await submitMembershipApplication({
        title: data.title,
        first_name: data.firstName,
        middle_name: data.middleName,
        last_name: data.lastName,
        country_residence: data.countryResidence,
        state_residence: data.stateResidence,
        phone_code: data.phoneCode,
        phone: data.phone,
        email: data.email,
        password: data.password,
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
        membership_type: membershipType,
      })

      savePendingCheckout({
        token: result.checkoutToken,
        email: data.email.trim().toLowerCase(),
        tier: membershipType,
        firstName: data.firstName,
      })

      clearMembershipFormDraft()
      toast.success('Application saved. Redirecting to Zeffy for payment…')
      window.location.assign(result.zeffyUrl)
    } catch (error) {
      if (error instanceof DuplicateMemberEmailError) {
        setDuplicateEmail(true)
        setEditingFromReview(false)
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

  return (
    <div
      id="membership-form"
      className="mem-pad mem-form-section"
      style={{ background: '#f9fafb', paddingTop: '2rem' }}
    >
      <div className="mem-inner">
        <div className="mem-form-intro">
          <h2 className="font-heading mem-form-intro__title">Register</h2>
          <p className="mem-form-intro__subtitle">
            Fill in your membership application below. Your progress is saved automatically on this
            device so you can resume later.
          </p>
        </div>

        <div className="mem-form-card">
          {resumedAt ? (
            <div className="mem-form-progress-banner" data-testid="membership-form-resume-banner">
              <div>
                <p className="mem-form-progress-banner__title">Application restored</p>
                <p className="mem-form-progress-banner__copy">
                  We picked up where you left off from {formatDraftSavedAt(resumedAt)}. Passwords
                  are not stored. Re-enter them on step 1 before submitting.
                </p>
              </div>
              <button
                type="button"
                className="mem-form-progress-banner__reset"
                data-testid="membership-form-start-over"
                onClick={startOver}
              >
                Start over
              </button>
            </div>
          ) : null}

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
                  <div className="mem-form-choice-grid">
                    {['Ms', 'Mr', 'Dr', 'Mrs'].map((t) => (
                      <label key={t} className="mem-form-choice">
                        <input type="radio" value={t} {...registerField('title')} />
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
                  <Controller
                    name="countryResidence"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        name={field.name}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(country) => {
                          field.onChange(country)
                          setValue('stateResidence', '', {
                            shouldValidate: false,
                            shouldDirty: true,
                          })
                          const phoneCountryIso = getCountryIsoCode(country)
                          if (phoneCountryIso) {
                            setValue('phoneCode', phoneCountryIso)
                            void trigger('phone')
                          }
                          void trigger('countryResidence')
                        }}
                        options={COUNTRY_OPTIONS}
                        placeholder="Select country"
                        searchPlaceholder="Search countries…"
                        hasError={!!errors.countryResidence}
                        testId="country-residence-select"
                      />
                    )}
                  />
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
                        testId="state-residence-select"
                      />
                    )}
                  />
                </div>

                <div className="mem-form-phone-grid" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Country Code</label>
                    <Controller
                      name="phoneCode"
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          name={field.name}
                          value={field.value ?? ''}
                          onBlur={field.onBlur}
                          onChange={(value) => {
                            field.onChange(value)
                            void trigger('phone')
                          }}
                          options={PHONE_CODE_OPTIONS}
                          placeholder="Select code"
                          searchPlaceholder="Search country or code…"
                          hasError={!!errors.phoneCode}
                          testId="phone-code-select"
                        />
                      )}
                    />
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
                      {...registerField('phone')}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle} htmlFor="membership-password">
                    Password
                    <RequiredMark />
                  </label>
                  <PasswordField
                    id="membership-password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    hasError={!!errors.password}
                    testId="membership-password"
                    {...registerPasswordField('password')}
                  />
                  <FieldError message={errors.password?.message} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle} htmlFor="membership-confirm-password">
                    Confirm password
                    <RequiredMark />
                  </label>
                  <PasswordField
                    id="membership-confirm-password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    hasError={!!errors.confirmPassword}
                    testId="membership-confirm-password"
                    {...registerPasswordField('confirmPassword')}
                  />
                  <FieldError message={errors.confirmPassword?.message} />
                </div>

                <div className="mem-form-step-actions mem-form-step-actions--end">
                  {editingFromReview ? (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="edit-section-done"
                      onClick={() => finishEditing(1)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      onClick={() => next(1)}
                    >
                      Next &rarr;
                    </button>
                  )}
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
                  <div className="mem-form-choice-grid">
                    {(['yes', 'no'] as const).map((v) => (
                      <label key={v} className="mem-form-choice">
                        <input type="radio" value={v} {...registerField('isStudent')} />
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
                  <FormDropdownField
                    name="education"
                    control={control}
                    trigger={trigger}
                    placeholder="-Select-"
                    options={EDUCATION_OPTIONS}
                    hasError={!!errors.education}
                    testId="education-select"
                  />
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
                  <Controller
                    name="countryPractice"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        name={field.name}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(country) => {
                          field.onChange(country)
                          setValue('statePractice', '', {
                            shouldValidate: false,
                            shouldDirty: true,
                          })
                          void trigger('countryPractice')
                        }}
                        options={COUNTRY_OPTIONS}
                        placeholder="Select country"
                        searchPlaceholder="Search countries…"
                        hasError={!!errors.countryPractice}
                        testId="country-practice-select"
                      />
                    )}
                  />
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
                        testId="state-practice-select"
                      />
                    )}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>
                    License status <span style={{ color: '#cc0000' }}>*</span>
                  </label>
                  <FormDropdownField
                    name="licenceStatus"
                    control={control}
                    trigger={trigger}
                    placeholder="-Select-"
                    options={LICENCE_STATUS_OPTIONS}
                    hasError={!!errors.licenceStatus}
                    testId="licence-status-select"
                  />
                  <FieldError message={errors.licenceStatus?.message} />
                </div>

                <div
                  className={`mem-form-step-actions${editingFromReview ? ' mem-form-step-actions--end' : ''}`}
                >
                  {!editingFromReview && (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--secondary"
                      onClick={() => prev(2)}
                    >
                      &larr; Previous
                    </button>
                  )}
                  {editingFromReview ? (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="edit-section-done"
                      onClick={() => finishEditing(2)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      onClick={() => next(2)}
                    >
                      Next &rarr;
                    </button>
                  )}
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
                  <Controller
                    name="nursingEducation"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        name={field.name}
                        value={field.value ?? ''}
                        onBlur={field.onBlur}
                        onChange={(country) => {
                          field.onChange(country)
                          void trigger('nursingEducation')
                        }}
                        options={COUNTRY_OPTIONS}
                        placeholder="Select country"
                        searchPlaceholder="Search countries…"
                        hasError={!!errors.nursingEducation}
                        testId="nursing-education-select"
                      />
                    )}
                  />
                  <FieldError message={errors.nursingEducation?.message} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                    Employment status <span style={{ color: '#cc0000' }}>*</span>
                  </label>
                  <div className="mem-form-choice-grid">
                    {['Full-time', 'Part-time', 'Per-diem', 'Retired', 'Unemployed'].map((e) => (
                      <label key={e} className="mem-form-choice">
                        <input type="radio" value={e} {...registerField('employmentStatus')} />
                        {e}
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
                  <FormDropdownField
                    name="positionTitle"
                    control={control}
                    trigger={trigger}
                    placeholder="-Select-"
                    options={POSITION_TITLE_OPTIONS}
                    hasError={!!errors.positionTitle}
                    testId="position-title-select"
                  />
                  <FieldError message={errors.positionTitle?.message} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>
                    Practice setting <span style={{ color: '#cc0000' }}>*</span>
                  </label>
                  <FormDropdownField
                    name="practiceSetting"
                    control={control}
                    trigger={trigger}
                    placeholder="-Select-"
                    options={PRACTICE_SETTING_OPTIONS}
                    hasError={!!errors.practiceSetting}
                    testId="practice-setting-select"
                  />
                  <FieldError message={errors.practiceSetting?.message} />
                </div>

                <div
                  className={`mem-form-step-actions${editingFromReview ? ' mem-form-step-actions--end' : ''}`}
                >
                  {!editingFromReview && (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--secondary"
                      onClick={() => prev(3)}
                    >
                      &larr; Previous
                    </button>
                  )}
                  {editingFromReview ? (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="edit-section-done"
                      onClick={() => finishEditing(3)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      onClick={() => next(3)}
                    >
                      Next &rarr;
                    </button>
                  )}
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
                  Choose Professional ($75/year) or Premium ($150/year) membership.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>
                    Membership <span style={{ color: '#cc0000' }}>*</span>
                  </label>
                  <FormDropdownField
                    name="membershipType"
                    control={control}
                    trigger={trigger}
                    placeholder="-Select-"
                    options={MEMBERSHIP_TYPE_OPTIONS}
                    hasError={!!errors.membershipType}
                    testId="membership-type-select"
                  />
                  <FieldError message={errors.membershipType?.message} />
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Ghana/Africa members may qualify for local pricing (300 GHS / 600 GHS).
                  </p>
                </div>

                <div
                  className={`mem-form-step-actions${editingFromReview ? ' mem-form-step-actions--end' : ''}`}
                >
                  {!editingFromReview && (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--secondary"
                      onClick={() => prev(4)}
                    >
                      &larr; Previous
                    </button>
                  )}
                  {editingFromReview ? (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="edit-section-done"
                      onClick={() => finishEditing(4)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="membership-form-go-review"
                      onClick={() => next(4)}
                    >
                      Review &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <MembershipFormReview
                values={formValues}
                onEdit={startEditing}
                submitError={submitError}
                submitting={submitting}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
