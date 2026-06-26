import { useState, type CSSProperties } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../lib/passwordResetSchema'
import { resetMemberPassword } from '../lib/passwordReset'
import { PORTAL_FORGOT_PASSWORD_PATH, PORTAL_LOGIN_PATH } from '../lib/memberAuth'
import { PasswordField } from '../components/form/PasswordField'

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

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/portal/reset-password' })
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const registerField = (name: keyof ResetPasswordFormValues) => {
    const { onChange, ...rest } = register(name)
    return {
      ...rest,
      onChange: (event: Parameters<NonNullable<typeof onChange>>[0]) => {
        void onChange(event)
        void trigger(['password', 'confirmPassword'])
      },
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.')
      return
    }

    setSubmitting(true)
    try {
      await resetMemberPassword(token, data.password)
      toast.success('Password updated. You can sign in now.')
      navigate({ to: PORTAL_LOGIN_PATH })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reset password.')
    } finally {
      setSubmitting(false)
    }
  })

  if (!token) {
    return (
      <section
        className="animate-fade-in"
        style={{
          background: '#f9fafb',
          minHeight: 'calc(100vh - 180px)',
          padding: '3rem 1rem 6rem',
        }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h1
            className="font-heading"
            style={{ fontSize: '2rem', fontWeight: 900, color: '#0D3D2B' }}
          >
            Invalid reset link
          </h1>
          <p style={{ color: '#64748b', margin: '1rem 0 1.5rem' }}>
            This password reset link is missing or invalid.
          </p>
          <Link to={PORTAL_FORGOT_PASSWORD_PATH} style={{ color: '#0D3D2B', fontWeight: 700 }}>
            Request a new reset link
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section
      className="animate-fade-in"
      style={{ background: '#f9fafb', minHeight: 'calc(100vh - 180px)', padding: '3rem 1rem 6rem' }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            className="font-heading"
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#0D3D2B',
              marginBottom: '0.5rem',
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Choose a new password for your account.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <form onSubmit={onSubmit} noValidate>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle} htmlFor="password">
                New password <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <PasswordField
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hasError={!!errors.password}
                testId="portal-reset-password"
                {...registerField('password')}
              />
              {errors.password?.message && <p style={errorTextStyle}>{errors.password.message}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle} htmlFor="confirmPassword">
                Confirm password <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <PasswordField
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                hasError={!!errors.confirmPassword}
                testId="portal-reset-confirm-password"
                {...registerField('confirmPassword')}
              />
              {errors.confirmPassword?.message && (
                <p style={errorTextStyle}>{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#0D3D2B',
                color: '#fff',
                border: 'none',
                padding: '14px 24px',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            <Link to={PORTAL_LOGIN_PATH} style={{ color: '#0D3D2B', fontWeight: 700 }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
