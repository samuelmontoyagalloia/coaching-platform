import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { userId: string; role: string }
    req.user = { userId: payload.userId, role: payload.role ?? 'client' }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export default authenticate
