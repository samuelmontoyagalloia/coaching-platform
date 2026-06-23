import { describe, it, expect, vi, beforeEach } from 'vitest'
import supertest from 'supertest'

vi.hoisted(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
})

const mockSign = vi.hoisted(() => vi.fn(() => 'signed-jwt'))
const mockVerify = vi.hoisted(() => vi.fn())
vi.mock('jsonwebtoken', () => ({
  default: { sign: mockSign, verify: mockVerify },
  sign: mockSign,
  verify: mockVerify,
}))

const mockFindUnique = vi.hoisted(() => vi.fn())
const mockPasskeyCreate = vi.hoisted(() => vi.fn())
const mockPasskeyUpdate = vi.hoisted(() => vi.fn())
vi.mock('../lib/prisma.js', () => ({
  default: {
    user: { findUnique: mockFindUnique },
    passkey: { create: mockPasskeyCreate, update: mockPasskeyUpdate },
  },
}))

const mockGenRegOpts = vi.hoisted(() => vi.fn())
const mockVerifyRegResp = vi.hoisted(() => vi.fn())
const mockGenAuthOpts = vi.hoisted(() => vi.fn())
const mockVerifyAuthResp = vi.hoisted(() => vi.fn())
vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: mockGenRegOpts,
  verifyRegistrationResponse: mockVerifyRegResp,
  generateAuthenticationOptions: mockGenAuthOpts,
  verifyAuthenticationResponse: mockVerifyAuthResp,
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

function authBearer(token = 'valid-token') {
  return { Authorization: `Bearer ${token}` }
}

describe('passkey routes', () => {
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
    mockVerify.mockReturnValue({ userId: 'u1', role: 'client' })
    mockFindUnique.mockResolvedValue(null)
    mockGenRegOpts.mockResolvedValue({ challenge: 'default' })
    mockVerifyRegResp.mockResolvedValue({ verified: false, registrationInfo: null })
    mockGenAuthOpts.mockResolvedValue({ challenge: 'default' })
    mockVerifyAuthResp.mockResolvedValue({ verified: false, authenticationInfo: null })
  })

  // ── Register Start ─────────────────────────────────────────────
  describe('POST /auth/passkey/register/start', () => {
    it('returns 401 without token', async () => {
      const res = await supertest(app).post('/auth/passkey/register/start')
      expect(res.status).toBe(401)
    })

    it('returns 404 when user not found', async () => {
      const res = await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('generates registration options for valid user', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u1', email: 'client@test.com',
        passkeys: [{ credential_id: 'existing-key' }],
      })
      const expected = { challenge: 'abc', rp: { name: 'Coaching Platform' } }
      mockGenRegOpts.mockResolvedValueOnce(expected)

      const res = await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())
      expect(res.status).toBe(200)
      expect(res.body).toEqual(expected)
    })

    it('excludes existing credentials', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u1', email: 'c@t.com',
        passkeys: [{ credential_id: 'key1' }, { credential_id: 'key2' }],
      })
      mockGenRegOpts.mockResolvedValueOnce({ challenge: 'def' })

      await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())

      const call = mockGenRegOpts.mock.calls[0][0]
      expect(call.excludeCredentials).toEqual([{ id: 'key1' }, { id: 'key2' }])
    })
  })

  // ── Register Finish ─────────────────────────────────────────────
  describe('POST /auth/passkey/register/finish', () => {
    it('returns 401 without token', async () => {
      const res = await supertest(app).post('/auth/passkey/register/finish')
      expect(res.status).toBe(401)
    })

    it('returns 400 when no challenge was started', async () => {
      mockVerify.mockReturnValueOnce({ userId: 'no-challenge-user', role: 'client' })
      mockFindUnique.mockResolvedValueOnce({ id: 'no-challenge-user', email: 'c@t.com', passkeys: [] })

      const res = await supertest(app)
        .post('/auth/passkey/register/finish')
        .set(authBearer())
        .send({ id: 'cred-1' })
      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Challenge not found')
    })

    it('returns 400 when webauthn verification throws', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', email: 'c@t.com', passkeys: [] })
      await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())
      mockVerifyRegResp.mockRejectedValueOnce(new Error('bad signature'))

      const res = await supertest(app)
        .post('/auth/passkey/register/finish')
        .set(authBearer())
        .send({ id: 'cred-1' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('bad signature')
    })

    it('returns 400 when verification fails', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', email: 'c@t.com', passkeys: [] })
      await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())

      const res = await supertest(app)
        .post('/auth/passkey/register/finish')
        .set(authBearer())
        .send({ id: 'cred-1' })
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Verification failed')
    })

    it('stores passkey and returns success on valid registration', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', email: 'c@t.com', passkeys: [] })
      await supertest(app)
        .post('/auth/passkey/register/start')
        .set(authBearer())

      const fakeCred = { id: 'cred-1', publicKey: new Uint8Array([1, 2, 3]), counter: 0, transports: ['internal'] }
      mockVerifyRegResp.mockResolvedValueOnce({
        verified: true,
        registrationInfo: { credential: fakeCred, credentialDeviceType: 'multi-platform', credentialBackedUp: true },
      })
      mockPasskeyCreate.mockResolvedValueOnce({ id: 'pk-1' })

      const res = await supertest(app)
        .post('/auth/passkey/register/finish')
        .set(authBearer())
        .send({ id: 'cred-1' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  // ── Login Start ────────────────────────────────────────────────
  describe('POST /auth/passkey/login/start', () => {
    it('returns 400 without email', async () => {
      const res = await supertest(app).post('/auth/passkey/login/start').send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('email is required')
    })

    it('returns 404 when user has no passkeys', async () => {
      mockFindUnique.mockResolvedValueOnce({ id: 'u1', passkeys: [] })
      const res = await supertest(app)
        .post('/auth/passkey/login/start')
        .send({ email: 'client@test.com' })
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('No passkeys registered for this user')
    })

    it('returns 404 when user not found', async () => {
      const res = await supertest(app)
        .post('/auth/passkey/login/start')
        .send({ email: 'unknown@test.com' })
      expect(res.status).toBe(404)
    })

    it('generates authentication options for user with passkeys', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'u1', passkeys: [{ credential_id: 'pk-1' }, { credential_id: 'pk-2' }],
      })
      mockGenAuthOpts.mockResolvedValueOnce({
        challenge: 'challenge-123',
        allowCredentials: [{ id: 'pk-1' }, { id: 'pk-2' }],
      })

      const res = await supertest(app)
        .post('/auth/passkey/login/start')
        .send({ email: 'client@test.com' })

      expect(res.status).toBe(200)
      expect(res.body.challenge).toBe('challenge-123')
      expect(mockGenAuthOpts).toHaveBeenCalledWith(
        expect.objectContaining({
          rpID: 'localhost',
          allowCredentials: [{ id: 'pk-1' }, { id: 'pk-2' }],
        })
      )
    })
  })

  // ── Login Finish ────────────────────────────────────────────────
  describe('POST /auth/passkey/login/finish', () => {
    it('returns 400 without email and response', async () => {
      const res = await supertest(app).post('/auth/passkey/login/finish').send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('email and response are required')
    })

    it('returns 400 without response', async () => {
      const res = await supertest(app)
        .post('/auth/passkey/login/finish')
        .send({ email: 'c@t.com' })
      expect(res.status).toBe(400)
    })

    it('returns 404 when user not found', async () => {
      const res = await supertest(app)
        .post('/auth/passkey/login/finish')
        .send({ email: 'c@t.com', response: { id: 'cred-1' } })
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('User not found')
    })

    it('returns 400 when no challenge was started', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'no-challenge-user', role: 'client',
        passkeys: [{ credential_id: 'cred-1', public_key: '', counter: 0n }],
      })

      const res = await supertest(app)
        .post('/auth/passkey/login/finish')
        .send({ email: 'c@t.com', response: { id: 'cred-1' } })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Challenge not found')
    })

    it('returns 400 when passkey not found', async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: 'different-user', role: 'client',
        passkeys: [{ credential_id: 'pk-1', public_key: '', counter: 0n }],
      })
      await supertest(app)
        .post('/auth/passkey/login/start')
        .send({ email: 'other@t.com' })
      mockGenAuthOpts.mockResolvedValueOnce({ challenge: 'ch' })

      mockFindUnique.mockResolvedValueOnce({
        id: 'different-user', role: 'client',
        passkeys: [{ credential_id: 'pk-1', public_key: '', counter: 0n }],
      })

      const res = await supertest(app)
        .post('/auth/passkey/login/finish')
        .send({ email: 'other@t.com', response: { id: 'non-existent' } })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Passkey not found')
    })

    it('returns JWT on successful authentication', async () => {
      const passKey = { credential_id: 'pk-1', public_key: Buffer.from([1, 2, 3]).toString('base64'), counter: 5n }
      mockFindUnique.mockResolvedValueOnce({ id: 'success-user', role: 'client', passkeys: [passKey] })
      await supertest(app)
        .post('/auth/passkey/login/start')
        .send({ email: 'ok@t.com' })
      mockGenAuthOpts.mockResolvedValueOnce({ challenge: 'ch' })

      mockFindUnique.mockResolvedValueOnce({ id: 'success-user', role: 'client', passkeys: [passKey] })
      mockVerifyAuthResp.mockResolvedValueOnce({
        verified: true,
        authenticationInfo: { newCounter: 6 },
      })

      const res = await supertest(app)
        .post('/auth/passkey/login/finish')
        .send({ email: 'ok@t.com', response: { id: 'pk-1' } })

      expect(res.status).toBe(200)
      expect(res.body.token).toBe('signed-jwt')
      expect(mockSign).toHaveBeenCalledWith(
        { userId: 'success-user', role: 'client' },
        'test-secret',
        { expiresIn: '7d' }
      )
      expect(mockPasskeyUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { credential_id: 'pk-1' },
          data: { counter: 6 },
        })
      )
    })
  })
})
