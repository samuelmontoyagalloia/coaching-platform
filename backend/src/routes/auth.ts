import { Router, type Request, type Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

const router = Router()

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${frontendUrl}/login?error=unauthorized`,
  }),
  (req: Request, res: Response) => {
    const { userId } = req.user!
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
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
    name: user.client?.name ?? null,
    role: user.role,
    client_id: user.client_id,
  })
})

export default router
