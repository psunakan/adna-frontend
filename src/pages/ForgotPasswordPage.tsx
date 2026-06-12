import { useState, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../lib/passwordResetSchema'
import { requestPasswordReset } from '../lib/passwordReset'
import { PORTAL_LOGIN_PATH } from '../lib/memberAuth'

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
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

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

export function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    try {
      const result = await requestPasswordReset(data.email)
      setSent(true)
      toast.success(result.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send reset email.')
    } finally {
      setSubmitting(false)
    }
  })

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
            Forgot Password
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Enter your email and we&apos;ll send you a link to reset your password.
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
          {sent ? (
            <div style={{ textAlign: 'center', color: '#374151', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '1.5rem' }}>
                If an account exists for that email, you will receive reset instructions shortly.
                Check your inbox and spam folder.
              </p>
              <Link
                to={PORTAL_LOGIN_PATH}
                style={{ color: '#0D3D2B', fontWeight: 700, textDecoration: 'none' }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle} htmlFor="email">
                  Email <span style={{ color: '#cc0000' }}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  style={fieldStyle(!!errors.email)}
                  {...register('email')}
                />
                {errors.email?.message && <p style={errorTextStyle}>{errors.email.message}</p>}
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
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          {!sent && (
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
          )}
        </div>
      </div>
    </section>
  )
}
