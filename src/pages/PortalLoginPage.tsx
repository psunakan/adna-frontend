import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { loginSchema, type LoginFormValues } from '../lib/loginSchema'
import { useMemberAuth } from '../lib/MemberAuthProvider'
import { PORTAL_FORGOT_PASSWORD_PATH, PORTAL_PATH } from '../lib/memberAuth'
import { adnaLogoUrl } from '../lib/branding'
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

function fieldStyle(hasError: boolean): CSSProperties {
  return hasError ? { ...inputStyle, borderColor: '#cc0000' } : inputStyle
}

export function PortalLoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading } = useMemberAuth()
  const [submitting, setSubmitting] = useState(false)
  const logoUrl = adnaLogoUrl(window.location.origin)

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
    <section className="portal-auth-page animate-fade-in">
      <div className="portal-auth-shell">
        <div className="portal-auth-brand">
          <img
            src={logoUrl}
            alt="African-Diaspora Nursing Alliance"
            className="portal-auth-brand__logo"
          />
        </div>

        <div className="portal-auth-card">
          <div className="portal-tricolor" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <h1 className="portal-auth-title font-heading">Member Portal</h1>
          <p className="portal-auth-lead">Sign in to manage your membership, payments, and verification letter.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="portal-field">
              <label htmlFor="email">
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
              {errors.email?.message && (
                <p className="portal-field-error">{errors.email.message}</p>
              )}
            </div>

            <div className="portal-field">
              <label htmlFor="password">
                Password <span style={{ color: '#cc0000' }}>*</span>
              </label>
              <PasswordField
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                hasError={!!errors.password}
                testId="portal-login-password"
                {...register('password')}
              />
              {errors.password?.message && (
                <p className="portal-field-error">{errors.password.message}</p>
              )}
              <p style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <Link
                  to={PORTAL_FORGOT_PASSWORD_PATH}
                  style={{ color: '#0D3D2B', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Forgot password?
                </Link>
              </p>
            </div>

            <button type="submit" disabled={submitting} className="portal-btn portal-btn--primary">
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="portal-auth-footer">
            Not a member yet? <Link to="/membership">Register for membership</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
