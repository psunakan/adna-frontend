const STEPS = [
  { id: 1, label: 'Personal Info', short: 'Personal' },
  { id: 2, label: 'Professional', short: 'Professional' },
  { id: 3, label: 'Experience', short: 'Experience' },
  { id: 4, label: 'Membership', short: 'Membership' },
  { id: 5, label: 'Review & Submit', short: 'Review' },
] as const

export type MembershipStepperStep = {
  id: number
  label: string
  short: string
}

type Props = {
  step: number
  completed: number[]
  onGoToStep: (step: number) => void
  steps?: MembershipStepperStep[]
}

export function MembershipFormStepper({ step, completed, onGoToStep, steps = [...STEPS] }: Props) {
  const current = steps.find((item) => item.id === step) ?? steps[steps.length - 1]
  const progress = (step / steps.length) * 100

  return (
    <div className="mem-form-stepper" aria-label="Registration progress">
      <div className="mem-form-stepper__head">
        <div className="mem-form-stepper__intro">
          <p className="mem-form-stepper__kicker">Membership application</p>
          <h3 className="mem-form-stepper__title">{current?.label}</h3>
        </div>
      </div>

      <div
        className="mem-form-stepper__bar"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={current?.label}
      >
        <div className="mem-form-stepper__bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <nav className="mem-form-stepper__nav" aria-label="Form sections">
        <ol className="mem-form-stepper__segments">
          {steps.map(({ id, label, short }) => {
            const isActive = step === id
            const isDone = id < step || completed.includes(id)
            const isClickable = isActive || id < step

            return (
              <li key={id} className="mem-form-stepper__segment-item">
                <button
                  type="button"
                  className={[
                    'mem-form-stepper__segment',
                    isActive ? 'is-active' : '',
                    isDone ? 'is-done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => isClickable && onGoToStep(id)}
                  disabled={!isClickable}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="mem-form-stepper__segment-label mem-form-stepper__segment-label--full">
                    {label}
                  </span>
                  <span className="mem-form-stepper__segment-label mem-form-stepper__segment-label--short">
                    {short}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
