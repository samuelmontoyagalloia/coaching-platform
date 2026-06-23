import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('displays the login page with branding', async ({ page }) => {
    await expect(page.getByText('Coaching')).toBeVisible()
    await expect(page.getByText('1:1')).toBeVisible()
    await expect(page.getByText('Tu espacio de ejecución')).toBeVisible()
    await expect(page.getByText('Encuentra tu')).toBeVisible()
    await expect(page.getByText('negocio')).toBeVisible()
  })

  test('shows Google login button', async ({ page }) => {
    const button = page.getByText('Continuar con Google')
    await expect(button).toBeVisible()
  })

  test('shows access denied message when error param is present', async ({ page }) => {
    await page.goto('/login?error=access_denied')
    await expect(page.getByText('Tu inicio de sesión fue denegado.')).toBeVisible()
    await expect(page.getByText('Escribirle a Samuel')).toBeVisible()
  })

  test('shows biometric login for returning users', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('sc_returning', 'true')
      localStorage.setItem('user_name', 'Samuel')
      localStorage.setItem('user_email', 'samuel@test.com')
      localStorage.setItem('user_photo', '')
    })
    await page.reload()
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible()
    await expect(page.getByText('Samuel')).toBeVisible()
  })

  test('allows switching account from biometric view', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('sc_returning', 'true')
      localStorage.setItem('user_name', 'Samuel')
    })
    await page.reload()
    await page.getByText('Usar otra cuenta').click()
    await expect(page.getByText('Continuar con Google')).toBeVisible()
  })

  test('redirects to /login from / when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Tu espacio de ejecución')).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('redirects to /login when accessing /dashboard without token', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('shows dashboard with valid token', async ({ page }) => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('user_name', 'Samuel')
    }, token)

    await page.goto('/dashboard')
    await expect(page.getByText('Bienvenido,')).toBeVisible()
    await expect(page.getByText('Samuel.')).toBeVisible()
    await expect(page.getByText('Cerrar sesión')).toBeVisible()
  })

  test('triggers logout flow', async ({ page }) => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('user_name', 'Samuel')
    }, token)

    await page.goto('/dashboard')
    await page.getByText('Cerrar sesión').click()
    await expect(page.getByText('Hasta pronto, Samuel.')).toBeVisible()
  })
})

test.describe('Admin', () => {
  test('redirects to /login when accessing /admin without token', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/login')
  })

  test('shows admin panel for admin users', async ({ page }) => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'a1', role: 'admin', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
    }, token)

    await page.goto('/admin')
    await expect(page.getByText('Panel de administración')).toBeVisible()
    await expect(page.getByText('Admin')).toBeVisible()
  })
})

test.describe('Root Redirect', () => {
  test('redirects to /dashboard for client users at /', async ({ page }) => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('user_name', 'Samuel')
    }, token)

    await page.goto('/')
    await expect(page).toHaveURL('/dashboard')
  })

  test('redirects to /admin for admin users at /', async ({ page }) => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'a1', role: 'admin', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
    }, token)

    await page.goto('/')
    await expect(page).toHaveURL('/admin')
  })
})
