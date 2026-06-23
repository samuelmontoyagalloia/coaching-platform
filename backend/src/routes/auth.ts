import { Router, type Request, type Response, type NextFunction } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

const router = Router()

const IS_TUNNEL = !!(process.env.TUNNEL_URL && process.env.NODE_ENV !== 'production')
const frontendUrl = IS_TUNNEL
  ? (process.env.FRONTEND_TUNNEL_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173')
  : (process.env.FRONTEND_URL ?? 'http://localhost:5173')

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

router.get(
  '/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'google',
      { session: false },
      (err: Error | null, user: { userId: string } | false, info: { message?: string } | undefined) => {
        console.log('[auth] Google callback — user:', user, '| info:', info, '| err:', err)
        if (err) return next(err)
        if (!user) {
          const code = info?.message === 'access_denied' ? 'access_denied' : 'unauthorized'
          console.log('[auth] Redirigiendo a /login?error=' + code)
          return res.redirect(`${frontendUrl}/login?error=${code}`)
        }
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
        console.log('[auth] Login exitoso, userId:', user.userId)
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
      }
    )(req, res, next)
  }
)

// Returns the authenticated user's profile info
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user!
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { client: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name ?? user.client?.name ?? null,
    photo_url: user.photo_url ?? null,
    role: user.role,
    client_id: user.client_id,
  })
})

export default router
