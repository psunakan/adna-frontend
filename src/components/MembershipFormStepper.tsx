const STEPS = [
  { id: 1, label: 'Personal Info', short: 'Personal' },
  { id: 2, label: 'Professional', short: 'Professional' },
  { id: 3, label: 'Experience', short: 'Experience' },
  { id: 4, label: 'Membership', short: 'Membership' },
] as const

type Props = {
  step: number
  completed: number[]
  onGoToStep: (step: number) => void
}

export function MembershipFormStepper({ step, completed, onGoToStep }: Props) {
  const current = STEPS[step - 1]
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="mem-form-stepper" aria-label="Registration progress">
      <div className="mem-form-stepper__meta">
        <p className="mem-form-stepper__eyebrow">
          Step {step} of {STEPS.length}
        </p>
        <p className="mem-form-stepper__title">{current.label}</p>
      </div>

      <div
        className="mem-form-stepper__rail"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${step} of ${STEPS.length}: ${current.label}`}
      >
        <div className="mem-form-stepper__rail-line" aria-hidden="true">
          <div className="mem-form-stepper__rail-fill" style={{ width: `${progress}%` }} />
        </div>

        <ol className="mem-form-stepper__nodes">
          {STEPS.map(({ id, label, short }) => {
            const isActive = step === id
            const isDone = id < step || completed.includes(id)
            const isClickable = isDone || isActive

            return (
              <li key={id} className="mem-form-stepper__node-wrap">
                <button
                  type="button"
                  className={[
                    'mem-form-stepper__node',
                    isActive ? 'is-active' : '',
                    isDone ? 'is-done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => isClickable && onGoToStep(id)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${label}${isDone ? ', completed' : isActive ? ', current' : ''}`}
                >
                  <span className="mem-form-stepper__node-inner">
                    {isDone && !isActive ? (
                      <svg
                        className="mem-form-stepper__check"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      id
                    )}
                  </span>
                </button>
                <span
                  className={[
                    'mem-form-stepper__node-label',
                    'mem-form-stepper__node-label--full',
                    isActive || isDone ? 'is-highlighted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </span>
                <span
                  className={[
                    'mem-form-stepper__node-label',
                    'mem-form-stepper__node-label--short',
                    isActive || isDone ? 'is-highlighted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {short}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
