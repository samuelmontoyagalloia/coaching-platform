import { test, expect } from '@playwright/test'

test.describe('Dashboard (new)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`

    await page.evaluate((t) => {
      localStorage.setItem('auth_token', t)
      localStorage.setItem('user_name', 'Samuel')
    }, token)
  })

  test('shows dashboard with all main sections', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Coaching')).toBeVisible()
    await expect(page.getByText('Privado')).toBeVisible()
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible()
    await expect(page.getByText('Samuel.')).toBeVisible()
    await expect(page.getByText('Racha').last()).toBeVisible()
    await expect(page.getByText('Sesiones')).toBeVisible()
    await expect(page.getByText('Proyecto a 10 años').last()).toBeVisible()
    await expect(page.getByText('Lo que construiste')).toBeVisible()
    await expect(page.getByText('Cerrar sesión')).toBeVisible()
  })

  test('shows session cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Ikigai — Fundamentos')).toBeVisible()
    await expect(page.getByText('Negocio e investigación')).toBeVisible()
    await expect(page.getByText('La oferta que vende')).toBeVisible()
    await expect(page.getByText('Ejecución y momentum')).toBeVisible()
  })

  test('shows built cards', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('IKIGAI', { exact: true })).toBeVisible()
    await expect(page.getByText('NEGOCIO', { exact: true })).toBeVisible()
    await expect(page.getByText('OFERTA', { exact: true })).toBeVisible()
  })

  test('shows streak section with weekday labels', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Racha').last()).toBeVisible()
    await expect(page.getByText('Días consecutivos ejecutando').last()).toBeVisible()
    await expect(page.getByText('L').last()).toBeVisible()
    await expect(page.getByText('V').last()).toBeVisible()
    await expect(page.getByText('S').last()).toBeVisible()
    await expect(page.getByText('D', { exact: true })).not.toBeVisible()
  })

  test('shows progress percentage', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('%').last()).toBeVisible()
  })

  test('shows chat badge', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('3').first()).toBeVisible()
  })

  test('triggers logout flow', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('Cerrar sesión').click()
    await expect(page.getByText('Hasta pronto, Samuel.')).toBeVisible()
  })

  test('redirects to /login when accessing /dashboard without token', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
