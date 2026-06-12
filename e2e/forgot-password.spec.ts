import { test, expect } from '@playwright/test'

test.describe('Forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('renders forgot password form from login page', async ({ page }) => {
    await page.goto('/portal/login')
    await expect(page.getByRole('heading', { name: 'Member Portal' })).toBeVisible()
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(/\/portal\/forgot-password/)
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
  })

  test('validates empty email submission', async ({ page }) => {
    await page.goto('/portal/forgot-password')
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible()
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByText('Email is required.')).toBeVisible()
  })

  test('links back to sign in', async ({ page }) => {
    await page.goto('/portal/forgot-password')
    await page.getByRole('link', { name: 'Back to sign in' }).click()
    await expect(page).toHaveURL(/\/portal\/login/)
  })
})

test.describe('Reset password', () => {
  test('shows invalid link message without token', async ({ page }) => {
    await page.goto('/portal/reset-password')
    await expect(page.getByRole('heading', { name: 'Invalid reset link' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Request a new reset link' })).toBeVisible()
  })

  test('renders reset form with token', async ({ page }) => {
    await page.goto('/portal/reset-password?token=test-token')
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()
    await expect(page.getByLabel('New password')).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
  })

  test('validates password mismatch', async ({ page }) => {
    await page.goto('/portal/reset-password?token=test-token')
    await page.getByLabel('New password').fill('password123')
    await page.getByLabel('Confirm password').fill('different456')
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByText('Passwords do not match.')).toBeVisible()
  })
})
