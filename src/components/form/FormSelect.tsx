import type { SelectHTMLAttributes } from 'react'

export type FormSelectOption = {
  value: string
  label: string
}

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: FormSelectOption[]
  placeholder?: string
  hasError?: boolean
}

export function FormSelect({
  options,
  placeholder,
  hasError = false,
  className = '',
  ...props
}: Props) {
  return (
    <div className="form-select-wrap">
      <select
        className={['form-select', hasError ? 'is-error' : '', className].filter(Boolean).join(' ')}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
