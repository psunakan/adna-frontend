import { forwardRef, useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  hasError?: boolean
  testId?: string
}

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { hasError = false, testId, className = '', style, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`password-field${hasError ? ' is-error' : ''}`}>
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`password-field__input${className ? ` ${className}` : ''}`}
        style={style}
        data-testid={testId}
        {...props}
      />
      <button
        type="button"
        className="password-field__toggle"
        data-testid={testId ? `${testId}-toggle` : undefined}
        aria-label={visible ? 'Hide characters' : 'Show characters'}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
})
