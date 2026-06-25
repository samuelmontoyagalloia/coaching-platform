import { Router, type Request, type Response } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user!
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { client: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  const startDate = user.client?.coaching_start_date
  const streak = startDate
    ? Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000)
    : 0

  res.json({
    name: user.name ?? user.client?.name ?? null,
    photo_url: user.photo_url ?? null,
    streak,
  })
})

export default router
