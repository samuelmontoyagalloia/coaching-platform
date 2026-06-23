import { describe, it, expect, vi, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'

import healthRouter from './health.js'

function createTestApp() {
  const app = express()
  app.use('/api/health', healthRouter)
  return app
}

describe('GET /api/health', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  it('returns 200 with status ok', async () => {
    const res = await supertest(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('includes an ISO timestamp', async () => {
    const before = new Date().toISOString().slice(0, 16)
    const res = await supertest(app).get('/api/health')
    const ts = res.body.timestamp
    expect(ts).toEqual(expect.any(String))
    expect(new Date(ts).toISOString()).toBe(ts)
    expect(ts.slice(0, 16)).toBe(before)
  })

  it('responds within reasonable time', async () => {
    const start = performance.now()
    await supertest(app).get('/api/health')
    expect(performance.now() - start).toBeLessThan(500)
  })
})
