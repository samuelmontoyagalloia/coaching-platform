import { describe, it, expect, vi, beforeEach } from 'vitest'
import supertest from 'supertest'

vi.hoisted(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.BACKEND_URL = 'http://localhost:3000'
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
})

const mockVerify = vi.hoisted(() => vi.fn())
const mockSign = vi.hoisted(() => vi.fn(() => 'signed-jwt'))

vi.mock('jsonwebtoken', () => ({
  default: { sign: mockSign, verify: mockVerify },
  sign: mockSign,
  verify: mockVerify,
}))

const mockFindUnique = vi.hoisted(() => vi.fn())

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: { findUnique: mockFindUnique },
    client: { findUnique: vi.fn() },
  },
}))

const googleMiddleware = vi.hoisted(() => vi.fn((req: any, res: any) => res.redirect('https://accounts.google.com')))
const passportAuthenticate = vi.hoisted(() => vi.fn(() => googleMiddleware))
vi.mock('passport', () => {
  const mockInitialize = vi.fn(() => (req: any, _res: any, next: any) => next())
  return {
    default: {
      authenticate: passportAuthenticate,
      initialize: mockInitialize,
      use: vi.fn(),
    },
    authenticate: passportAuthenticate,
    initialize: mockInitialize,
    use: vi.fn(),
  }
})

import { createApp } from '../app.js'

describe('auth routes', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
    mockVerify.mockReturnValue({ userId: 'u1', role: 'client' })
    mockFindUnique.mockResolvedValue(null)
  })

  describe('GET /auth/google', () => {
    it('responds (passport runs mock redirect)', async () => {
      const res = await supertest(app).get('/auth/google')
      expect(res.status).toBe(302)
    })
  })

  describe('GET /auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await supertest(app).get('/auth/me')
      expect(res.status).toBe(401)
    })

    it('returns user profile with valid token', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'client@test.com',
        name: 'Test Client',
        photo_url: 'https://example.com/photo.jpg',
        role: 'client',
        client_id: 'c1',
        client: { name: 'Client Name' },
      })

      const res = await supertest(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer good-token')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        id: 'u1',
        email: 'client@test.com',
        name: 'Test Client',
        photo_url: 'https://example.com/photo.jpg',
        role: 'client',
        client_id: 'c1',
      })
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: { client: true },
      })
    })

    it('falls back to client name when user name is null', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u2',
        email: 'client2@test.com',
        name: null,
        photo_url: null,
        role: 'client',
        client_id: 'c2',
        client: { name: 'Client Name' },
      })

      const res = await supertest(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer good-token')

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Client Name')
    })

    it('returns 404 for unknown user', async () => {
      const res = await supertest(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer good-token')

      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('returns null photo_url when not set', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u3',
        email: 'client3@test.com',
        name: 'Client Three',
        photo_url: null,
        role: 'client',
        client_id: 'c3',
        client: { name: 'Client Three' },
      })

      const res = await supertest(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer good-token')

      expect(res.status).toBe(200)
      expect(res.body.photo_url).toBeNull()
    })
  })

  describe('public path whitelist', () => {
    it('allows GET /api/health without token', async () => {
      const res = await supertest(app).get('/api/health')
      expect(res.status).toBe(200)
    })

    it('blocks POST /auth/me without token', async () => {
      const res = await supertest(app).post('/auth/me')
      expect(res.status).toBe(401)
    })
  })
})
