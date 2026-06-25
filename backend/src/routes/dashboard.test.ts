import { describe, it, expect, vi, beforeEach } from 'vitest'
import supertest from 'supertest'

vi.hoisted(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
})

const mockVerify = vi.hoisted(() => vi.fn())
vi.mock('jsonwebtoken', () => ({
  default: { verify: mockVerify, sign: vi.fn() },
  verify: mockVerify,
  sign: vi.fn(),
}))

const mockUserFindUnique = vi.hoisted(() => vi.fn())

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: { findUnique: mockUserFindUnique },
    client: { findUnique: vi.fn() },
  },
}))

const passportMiddleware = vi.hoisted(() => vi.fn())
vi.mock('passport', () => {
  const mockInitialize = vi.fn(() => (_req: any, _res: any, next: any) => next())
  return {
    default: {
      initialize: mockInitialize,
      authenticate: vi.fn(() => passportMiddleware),
      use: vi.fn(),
    },
    initialize: mockInitialize,
    authenticate: vi.fn(() => passportMiddleware),
    use: vi.fn(),
  }
})

import { createApp } from '../app.js'

describe('GET /api/dashboard', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
    mockVerify.mockReturnValue({ userId: 'u1', role: 'client' })
  })

  it('returns 401 without token', async () => {
    const res = await supertest(app).get('/api/dashboard')
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not found', async () => {
    mockUserFindUnique.mockResolvedValueOnce(null)
    const res = await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('User not found')
  })

  it('returns streak 0 when client has no coaching_start_date', async () => {
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'client@test.com',
      name: 'Test Client',
      photo_url: null,
      role: 'client',
      client_id: 'c1',
      client: { name: 'Test Client', coaching_start_date: null },
    })
    const res = await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(200)
    expect(res.body.streak).toBe(0)
  })

  it('returns streak calculated from coaching_start_date', async () => {
    const startDate = new Date(Date.now() - 5 * 86400000).toISOString()
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'client@test.com',
      name: 'Test Client',
      photo_url: 'https://example.com/photo.jpg',
      role: 'client',
      client_id: 'c1',
      client: { name: 'Test Client', coaching_start_date: startDate },
    })
    const res = await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(200)
    expect(res.body.streak).toBe(5)
    expect(res.body.name).toBe('Test Client')
    expect(res.body.photo_url).toBe('https://example.com/photo.jpg')
  })

  it('falls back to client name when user name is null', async () => {
    const startDate = new Date().toISOString()
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'u2',
      email: 'client2@test.com',
      name: null,
      photo_url: null,
      role: 'client',
      client_id: 'c2',
      client: { name: 'Client Two', coaching_start_date: startDate },
    })
    const res = await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token')
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Client Two')
    expect(res.body.photo_url).toBeNull()
  })

  it('includes user in prisma query with client relation', async () => {
    const startDate = new Date().toISOString()
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'u1',
      email: 'client@test.com',
      name: 'Test',
      photo_url: null,
      role: 'client',
      client_id: 'c1',
      client: { name: 'Test', coaching_start_date: startDate },
    })
    await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer valid-token')
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      include: { client: true },
    })
  })

  it('returns admin role data correctly', async () => {
    mockVerify.mockReturnValueOnce({ userId: 'a1', role: 'admin' })
    const startDate = new Date().toISOString()
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'a1',
      email: 'admin@test.com',
      name: 'Admin',
      photo_url: null,
      role: 'admin',
      client_id: 'c1',
      client: { name: 'Admin', coaching_start_date: startDate },
    })
    const res = await supertest(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer admin-token')
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Admin')
  })
})
