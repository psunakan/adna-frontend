import { test, expect } from '@playwright/test'

test.describe('Member portal login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portal/login')
  })

  test('renders login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Member Portal' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('validates empty submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Email is required.')).toBeVisible()
    await expect(page.getByText('Password is required.')).toBeVisible()
  })

  test('validates invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Password').fill('secret')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
  })

  test('links to membership registration', async ({ page }) => {
    await page.getByRole('link', { name: 'Register for membership' }).click()
    await expect(page).toHaveURL(/\/membership/)
  })

  test('links to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(/\/portal\/forgot-password/)
  })
})
