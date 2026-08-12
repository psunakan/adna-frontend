import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormTrigger,
  type UseFormWatch,
} from 'react-hook-form'
import type { CSSProperties } from 'react'
import { COUNTRIES, STATE_DATA } from '../../data/countries'
import { PHONE_CODE_OPTIONS } from '../../data/phoneCodeOptions'
import type { MembershipFormField } from '../../lib/adnaMembershipApi'
import type { DynamicFormValues } from '../../lib/membershipFormDynamic'
import { isFieldVisible } from '../../lib/membershipFormDynamic'
import { PasswordField } from '../form/PasswordField'
import { SearchableSelect } from '../form/SearchableSelect'
import { fieldInputId, fieldTestId } from './fieldIds'

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({ value: country, label: country }))

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p style={errorTextStyle}>{message}</p>
}

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

type Props = {
  field: MembershipFormField
  control: Control<DynamicFormValues>
  register: UseFormRegister<DynamicFormValues>
  trigger: UseFormTrigger<DynamicFormValues>
  setValue: UseFormSetValue<DynamicFormValues>
  watch: UseFormWatch<DynamicFormValues>
  errors: FieldErrors<DynamicFormValues>
  values: DynamicFormValues
  onCountryChange?: (fieldKey: string, country: string) => void
  /** When true, treat the email field as having a duplicate-email error state. */
  emailHasDuplicateError?: boolean
  onEmailChange?: () => void
}

export function DynamicMembershipField({
  field,
  control,
  register,
  trigger,
  setValue,
  watch,
  errors,
  values,
  onCountryChange,
  emailHasDuplicateError = false,
  onEmailChange,
}: Props) {
  if (!isFieldVisible(field, values)) return null

  const errorMessage = errors[field.key]?.message ? String(errors[field.key]?.message) : undefined
  const hasError = !!errorMessage || (field.key === 'email' && emailHasDuplicateError)
  const testId = fieldTestId(field)
  const inputId = fieldInputId(field)
  const options = (field.options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
  }))

  const label = (
    <label htmlFor={inputId} style={labelStyle}>
      {field.label}
      {field.required ? <RequiredMark /> : <span className="mem-form-optional"> (Optional)</span>}
    </label>
  )

  const help = field.helpText ? (
    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.35rem' }}>{field.helpText}</p>
  ) : null

  const widthClass =
    field.width === 'half' ? 'mem-form-field mem-form-field--half' : 'mem-form-field'

  if (field.type === 'password') {
    const { onChange, ...rest } = register(field.key)
    return (
      <div className={widthClass} style={{ marginBottom: '1rem' }}>
        {label}
        <PasswordField
          id={inputId}
          hasError={hasError}
          {...rest}
          onChange={(event) => {
            void onChange(event)
            const match = field.validation?.matchField
            void trigger(match ? [field.key, match] : field.key)
          }}
        />
        <FieldError message={errorMessage} />
        {help}
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div className={widthClass} style={{ marginBottom: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            {...register(field.key, {
              onChange: (event) => {
                if (field.key === 'showSpeciality' && !event.target.checked) {
                  setValue('licenceSpeciality', '', { shouldValidate: false })
                }
                void trigger(field.key)
              },
            })}
          />
          {field.label}
        </label>
        <FieldError message={errorMessage} />
      </div>
    )
  }

  if (field.type === 'checkbox_group') {
    const selected = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : []
    return (
      <fieldset className={widthClass} style={{ marginBottom: '1rem', border: 'none', padding: 0 }}>
        <legend style={{ ...labelStyle, marginBottom: '0.5rem', padding: 0 }}>
          {field.label}
          {field.required ? <RequiredMark /> : null}
        </legend>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: field.key === 'specialties' ? '1fr 1fr' : '1fr',
            gap: '0.4rem 1rem',
          }}
        >
          {options.map((option) => (
            <label
              key={option.value}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => {
                  const next = selected.includes(option.value)
                    ? selected.filter((item) => item !== option.value)
                    : [...selected, option.value]
                  setValue(field.key, next, { shouldValidate: true })
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError message={errorMessage} />
        {help}
      </fieldset>
    )
  }

  if (field.type === 'yes_no' || field.type === 'radio') {
    const radioOptions =
      field.type === 'yes_no' && options.length === 0
        ? [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]
        : options
    return (
      <fieldset className={widthClass} style={{ marginBottom: '1rem', border: 'none', padding: 0 }}>
        <legend style={{ ...labelStyle, marginBottom: '0.5rem', padding: 0 }}>
          {field.label}
          {field.required ? <RequiredMark /> : null}
        </legend>
        <div className="mem-form-choice-grid">
          {radioOptions.map((option) => (
            <label key={option.value} className="mem-form-choice">
              <input
                type="radio"
                value={option.value}
                {...register(field.key, {
                  onChange: () => {
                    void trigger(field.key)
                  },
                })}
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError message={errorMessage} />
        {help}
      </fieldset>
    )
  }

  if (field.type === 'country') {
    return (
      <div className={widthClass} style={{ marginBottom: '1rem' }}>
        {label}
        <Controller
          name={field.key}
          control={control}
          render={({ field: rhf }) => (
            <SearchableSelect
              id={inputId}
              name={rhf.name}
              value={String(rhf.value ?? '')}
              onBlur={rhf.onBlur}
              onChange={(country) => {
                rhf.onChange(country)
                onCountryChange?.(field.key, country)
                void trigger(field.key)
              }}
              options={COUNTRY_OPTIONS}
              placeholder={field.placeholder || 'Select country'}
              searchPlaceholder="Search countries…"
              hasError={hasError}
              testId={testId}
            />
          )}
        />
        <FieldError message={errorMessage} />
        {help}
      </div>
    )
  }

  if (field.type === 'state') {
    const countryKey = field.config?.countryField ?? 'countryResidence'
    const country = String(watch(countryKey) ?? '')
    const stateMeta = STATE_DATA[country]
    const stateOptions = (stateMeta?.options ?? []).map((value) => ({ value, label: value }))

    return (
      <div className={widthClass} style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
        <label htmlFor={inputId} style={labelStyle}>
          {stateMeta?.label ?? field.label}
          {field.required ? <RequiredMark /> : null}
        </label>
        {stateMeta ? (
          <Controller
            name={field.key}
            control={control}
            render={({ field: rhf }) => (
              <SearchableSelect
                id={inputId}
                name={rhf.name}
                value={String(rhf.value ?? '')}
                onBlur={rhf.onBlur}
                onChange={(value) => {
                  rhf.onChange(value)
                  void trigger(field.key)
                }}
                options={stateOptions}
                placeholder={`Select ${stateMeta.label.toLowerCase()}`}
                searchPlaceholder={`Search ${stateMeta.label.toLowerCase()}…`}
                hasError={hasError}
                testId={testId}
              />
            )}
          />
        ) : (
          <input
            id={inputId}
            type="text"
            style={fieldStyle(hasError)}
            placeholder={field.placeholder || 'State / Province / Region'}
            {...register(field.key)}
          />
        )}
        <FieldError message={errorMessage} />
        {help}
      </div>
    )
  }

  if (
    field.type === 'select' ||
    field.type === 'searchable_select' ||
    field.type === 'membership_type'
  ) {
    const selectOptions =
      field.key === 'phoneCode'
        ? PHONE_CODE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))
        : options

    const searchable = field.type === 'searchable_select' || field.key === 'phoneCode'

    return (
      <div className={widthClass} style={{ marginBottom: '1rem' }}>
        {label}
        <Controller
          name={field.key}
          control={control}
          render={({ field: rhf }) => (
            <SearchableSelect
              id={inputId}
              name={rhf.name}
              value={String(rhf.value ?? '')}
              onBlur={rhf.onBlur}
              onChange={(value) => {
                rhf.onChange(value)
                void trigger(field.key)
              }}
              options={selectOptions}
              placeholder={field.placeholder || '-Select-'}
              hasError={hasError}
              searchable={searchable}
              testId={testId}
            />
          )}
        />
        <FieldError message={errorMessage} />
        {help}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className={widthClass} style={{ marginBottom: '1rem' }}>
        {label}
        <textarea
          id={inputId}
          rows={4}
          style={fieldStyle(hasError)}
          placeholder={field.placeholder || undefined}
          {...register(field.key)}
        />
        <FieldError message={errorMessage} />
        {help}
      </div>
    )
  }

  return (
    <div className={widthClass} style={{ marginBottom: '1rem' }}>
      {label}
      <input
        id={inputId}
        type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
        style={fieldStyle(hasError)}
        placeholder={field.placeholder || undefined}
        autoComplete={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : undefined}
        {...register(field.key, {
          onChange: () => {
            if (field.key === 'email') onEmailChange?.()
            void trigger(field.key)
          },
        })}
      />
      <FieldError message={errorMessage} />
      {help}
    </div>
  )
}
