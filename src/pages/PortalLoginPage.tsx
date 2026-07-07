import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { loginSchema, type LoginFormValues } from '../lib/loginSchema'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { PORTAL_FORGOT_PASSWORD_PATH, PORTAL_PATH } from '../lib/memberAuth'
import { PasswordField } from '../components/form/PasswordField'

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
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

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

export function PortalLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading } = useMemberAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: PORTAL_PATH, replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate({ to: PORTAL_PATH })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.')
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
            Member Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Sign in to access your membership account.
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
              <label style={labelStyle} htmlFor="email">
                Email <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                style={fieldStyle(!!errors.email)}
                {...register('email')}
                id="email"
              />
              {errors.email?.message && <p style={errorTextStyle}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle} htmlFor="password">
                Password <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <PasswordField
                autoComplete="current-password"
                placeholder="Enter your password"
                hasError={!!errors.password}
                testId="portal-login-password"
                {...register('password')}
                id="password"
              />
              {errors.password?.message && <p style={errorTextStyle}>{errors.password.message}</p>}
              <p style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <Link
                  to={PORTAL_FORGOT_PASSWORD_PATH}
                  style={{ color: '#0D3D2B', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Forgot password?
                </Link>
              </p>
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
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              color: '#64748b',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Not a member yet?{' '}
            <Link to="/membership" style={{ color: '#0D3D2B', fontWeight: 700 }}>
              Register for membership
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
