import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockVerify = vi.hoisted(() => vi.fn())
vi.mock('jsonwebtoken', () => ({
  default: { verify: mockVerify },
  verify: mockVerify,
}))

const JWT_SECRET = 'test-secret'
process.env.JWT_SECRET = JWT_SECRET

import { authenticate } from './authenticate.js'

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any
}

function mockRes() {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('authenticate middleware', () => {
  const next = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = JWT_SECRET
  })

  it('returns 401 when no Authorization header', () => {
    const req = mockReq({})
    const res = mockRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when header does not start with Bearer', () => {
    const req = mockReq({ authorization: 'Basic abc123' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 for empty Bearer token (jwt verify throws on empty string)', () => {
    const req = mockReq({ authorization: 'Bearer ' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token verification throws', () => {
    mockVerify.mockImplementationOnce(() => { throw new Error('jwt malformed') })
    const req = mockReq({ authorization: 'Bearer bad-token' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when token is expired', () => {
    mockVerify.mockImplementationOnce(() => { throw new Error('jwt expired') })
    const req = mockReq({ authorization: 'Bearer expired-token' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next and sets req.user with valid token', () => {
    mockVerify.mockReturnValueOnce({ userId: 'u1', role: 'client' })
    const req = mockReq({ authorization: 'Bearer good-token' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(mockVerify).toHaveBeenCalledWith('good-token', JWT_SECRET)
    expect(req.user).toEqual({ userId: 'u1', role: 'client' })
    expect(next).toHaveBeenCalledOnce()
  })

  it('defaults role to client when not in payload', () => {
    mockVerify.mockReturnValueOnce({ userId: 'u2' })
    const req = mockReq({ authorization: 'Bearer token-no-role' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(req.user).toEqual({ userId: 'u2', role: 'client' })
    expect(next).toHaveBeenCalledOnce()
  })

  it('preserves admin role from payload', () => {
    mockVerify.mockReturnValueOnce({ userId: 'admin1', role: 'admin' })
    const req = mockReq({ authorization: 'Bearer admin-token' })
    const res = mockRes()
    authenticate(req, res, next)
    expect(req.user).toEqual({ userId: 'admin1', role: 'admin' })
    expect(next).toHaveBeenCalledOnce()
  })
})
