import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { getCountryIsoCode } from '../../data/countryIsoCodes'
import type { MembershipFormSchema } from '../../lib/adnaMembershipApi'
import {
  buildFormDefaults,
  buildZodSchema,
  fieldsForStep,
  inputSteps,
  reviewStepNumber,
  type DynamicFormValues,
} from '../../lib/membershipFormDynamic'
import {
  clearMembershipFormDraft,
  formatDraftSavedAt,
  loadMembershipFormDraft,
  saveMembershipFormDraft,
} from '../../lib/membershipFormProgress'
import { PORTAL_FORGOT_PASSWORD_PATH, PORTAL_LOGIN_PATH } from '../../lib/memberAuth'
import { savePendingCheckout } from '../../lib/membershipCheckout'
import {
  DuplicateMemberEmailError,
  submitMembershipApplicationFromValues,
} from '../../lib/submitMembershipApplication'
import { MembershipFormStepper } from '../MembershipFormStepper'
import { SchemaMembershipFormReview } from './SchemaMembershipFormReview'
import { DynamicMembershipField } from './DynamicMembershipField'

type Props = {
  schema: MembershipFormSchema
}

function DuplicateEmailAlert({ email }: { email: string }) {
  const forgotPasswordSearch = email.trim() ? { email: email.trim().toLowerCase() } : undefined

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
      An account with this email already exists.{' '}
      <Link to={PORTAL_LOGIN_PATH} style={{ color: '#991b1b', fontWeight: 600 }}>
        Sign in
      </Link>{' '}
      or{' '}
      <Link
        to={PORTAL_FORGOT_PASSWORD_PATH}
        search={forgotPasswordSearch}
        style={{ color: '#991b1b', fontWeight: 600 }}
      >
        reset your password
      </Link>
      .
    </div>
  )
}

export function SchemaMembershipForm({ schema }: Props) {
  const reviewStep = reviewStepNumber(schema)
  const steps = useMemo(() => inputSteps(schema), [schema])
  const defaults = useMemo(() => buildFormDefaults(schema), [schema])
  const zodSchema = useMemo(() => buildZodSchema(schema), [schema])

  const [step, setStep] = useState(1)
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
    getFieldState,
    formState: { errors },
  } = useForm<DynamicFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zodSchema as any),
    defaultValues: defaults,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const formValues = watch()
  const duplicateEmailValue = String(watch('email') ?? '')

  useEffect(() => {
    const draft = loadMembershipFormDraft()
    if (draft) {
      reset({
        ...defaults,
        ...draft.values,
        password: '',
        confirmPassword: '',
      })
      const restoredStep = Math.min(Math.max(draft.step, 1), reviewStep)
      setStep(restoredStep)
      setCompleted(draft.completed)
      setResumedAt(draft.savedAt)
    }
    progressReadyRef.current = true
  }, [defaults, reset, reviewStep])

  useEffect(() => {
    if (!progressReadyRef.current) return undefined

    const timeout = window.setTimeout(() => {
      const values = { ...getValues() }
      delete values.password
      delete values.confirmPassword
      saveMembershipFormDraft({
        step,
        completed,
        values: values as never,
      })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [formValues, step, completed, getValues])

  const scrollToForm = () => {
    document
      .getElementById('membership-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startOver = () => {
    clearMembershipFormDraft()
    reset(defaults)
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
      if (step === reviewStep && target < reviewStep) setEditingFromReview(true)
      setStep(target)
    }
  }

  const goToReview = () => {
    setEditingFromReview(false)
    setCompleted(steps.map((item) => item.number))
    setStep(reviewStep)
    scrollToForm()
  }

  const stepFieldKeys = (stepNumber: number) =>
    fieldsForStep(schema, stepNumber).map((field) => field.key)

  const showStepErrors = (stepNumber: number) => {
    const keys = stepFieldKeys(stepNumber)
    const fieldWithError = keys.find((key) => getFieldState(key).error?.message)
    if (fieldWithError) {
      toast.error(String(getFieldState(fieldWithError).error?.message))
      return
    }
    toast.error('Please complete all required fields.')
  }

  const next = async (from: number) => {
    const valid = await trigger(stepFieldKeys(from))
    if (!valid) {
      showStepErrors(from)
      return
    }

    markComplete(from)
    const lastInput = steps[steps.length - 1]?.number
    if (from === lastInput) {
      goToReview()
      return
    }
    setStep(from + 1)
    scrollToForm()
  }

  const finishEditing = async (from: number) => {
    const valid = await trigger(stepFieldKeys(from))
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

  const onInvalid = (fieldErrors: FieldErrors<DynamicFormValues>) => {
    for (const stepInfo of steps) {
      const keys = stepFieldKeys(stepInfo.number)
      const hit = keys.find((key) => fieldErrors[key]?.message)
      if (hit) {
        setEditingFromReview(false)
        setStep(stepInfo.number)
        scrollToForm()
        toast.error(String(fieldErrors[hit]?.message) || 'Please complete all required fields.')
        return
      }
    }
    toast.error('Please complete all required fields.')
  }

  const onCountryChange = (fieldKey: string, country: string) => {
    for (const field of schema.fields) {
      if (field.type === 'state' && field.config?.countryField === fieldKey) {
        setValue(field.key, '', { shouldValidate: false, shouldDirty: true })
      }
    }
    if (fieldKey === 'countryResidence') {
      const phoneCountryIso = getCountryIsoCode(country)
      if (phoneCountryIso) {
        setValue('phoneCode', phoneCountryIso)
        void trigger('phone')
      }
    }
  }

  const onSubmit = async (data: DynamicFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    setDuplicateEmail(false)

    try {
      const membershipType = String(data.membershipType ?? '')
      if (membershipType !== 'diaspora' && membershipType !== 'premium') {
        throw new Error('Please select a membership type.')
      }

      const result = await submitMembershipApplicationFromValues(data)

      savePendingCheckout({
        token: result.checkoutToken,
        email: String(data.email ?? '')
          .trim()
          .toLowerCase(),
        tier: membershipType as 'diaspora' | 'premium',
        firstName: String(data.firstName ?? ''),
      })

      clearMembershipFormDraft()
      toast.success('Application saved. Redirecting to Zeffy for payment…')
      window.location.assign(result.zeffyUrl)
    } catch (error) {
      if (error instanceof DuplicateMemberEmailError) {
        setDuplicateEmail(true)
        setEditingFromReview(false)
        setStep(1)
        setCompleted((completedSteps) => completedSteps.filter((n) => n !== 1))
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

  const currentStepMeta = schema.steps.find((item) => item.number === step)
  const visibleFields = fieldsForStep(schema, step)

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

          <MembershipFormStepper
            step={step}
            completed={completed}
            onGoToStep={goToStep}
            steps={schema.steps.map((item) => ({
              id: item.number,
              label: item.title.replace(/\s+Cont\.$/, ''),
              short: item.title.split(' ')[0] ?? item.title,
            }))}
          />

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mem-form-body">
            {step !== reviewStep && (
              <div className="form-step">
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#0D3D2B',
                    marginBottom: '0.25rem',
                  }}
                >
                  {currentStepMeta?.title ?? `Step ${step}`}
                </h3>
                {currentStepMeta?.description ? (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                    {currentStepMeta.description}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                    Fields marked <span style={{ color: '#cc0000' }}>*</span> are required.
                  </p>
                )}

                <div className="mem-form-fields">
                  {(() => {
                    const nameKeys = new Set(['firstName', 'middleName', 'lastName'])
                    const nameFields = visibleFields.filter((field) => nameKeys.has(field.key))
                    const otherFields = visibleFields.filter((field) => !nameKeys.has(field.key))
                    const fieldProps = {
                      control,
                      register,
                      trigger,
                      setValue,
                      watch,
                      errors,
                      values: formValues,
                      onCountryChange,
                    }

                    return (
                      <>
                        {nameFields.length > 0 ? (
                          <div className="mem-form-name-grid" style={{ marginBottom: '1rem' }}>
                            {nameFields.map((field) => (
                              <DynamicMembershipField
                                key={field.key}
                                field={field}
                                {...fieldProps}
                              />
                            ))}
                          </div>
                        ) : null}
                        {otherFields.map((field) => (
                          <DynamicMembershipField key={field.key} field={field} {...fieldProps} />
                        ))}
                      </>
                    )
                  })()}
                </div>

                {step === 1 && duplicateEmail ? (
                  <DuplicateEmailAlert email={duplicateEmailValue} />
                ) : null}

                {step === 4 ? (
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Ghana/Africa members may qualify for local pricing (300 GHS / 600 GHS).
                  </p>
                ) : null}

                <div
                  className={`mem-form-step-actions${editingFromReview ? ' mem-form-step-actions--end' : ''}`}
                >
                  {!editingFromReview && step > 1 && (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--secondary"
                      onClick={() => prev(step)}
                    >
                      &larr; Previous
                    </button>
                  )}
                  {editingFromReview ? (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid="edit-section-done"
                      onClick={() => finishEditing(step)}
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mem-form-btn mem-form-btn--primary"
                      data-testid={
                        step === steps[steps.length - 1]?.number
                          ? 'membership-form-go-review'
                          : undefined
                      }
                      onClick={() => next(step)}
                    >
                      {step === steps[steps.length - 1]?.number ? 'Review →' : 'Next →'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === reviewStep && (
              <SchemaMembershipFormReview
                schema={schema}
                values={formValues}
                onEdit={(target) => {
                  setEditingFromReview(true)
                  setStep(target)
                  scrollToForm()
                }}
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
