import { Router, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import prisma from '../lib/prisma.js'

const router = Router()

const RP_NAME = 'Coaching Platform'

const IS_TUNNEL = !!(process.env.TUNNEL_URL && process.env.NODE_ENV !== 'production')
const ORIGIN = IS_TUNNEL
  ? (process.env.FRONTEND_TUNNEL_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173')
  : (process.env.FRONTEND_URL ?? 'http://localhost:5173')

const RP_ID = new URL(ORIGIN).hostname

// In-memory challenge store per user_id.
// Replace with Redis for multi-instance deployments.
const challengeStore = new Map<string, string>()

// ── POST /auth/passkey/register/start ─────────────────────────────────────────
router.post('/register/start', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user!

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { passkeys: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email,
    userDisplayName: user.email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    excludeCredentials: user.passkeys.map((pk) => ({ id: pk.credential_id })),
  })

  challengeStore.set(userId, options.challenge)
  res.json(options)
})

// ── POST /auth/passkey/register/finish ────────────────────────────────────────
router.post('/register/finish', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.user!

  const expectedChallenge = challengeStore.get(userId)
  if (!expectedChallenge) {
    res.status(400).json({ error: 'Challenge not found — call /register/start first' })
    return
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
    return
  }

  if (!verification.verified || !verification.registrationInfo) {
    res.status(400).json({ error: 'Verification failed' })
    return
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

  await prisma.passkey.create({
    data: {
      user_id: userId,
      credential_id: credential.id,
      // Store public key as base64 string
      public_key: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
      transports: credential.transports ? JSON.stringify(credential.transports) : null,
    },
  })

  challengeStore.delete(userId)
  res.json({ success: true })
})

// ── POST /auth/passkey/login/start ────────────────────────────────────────────
router.post('/login/start', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string }

  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { passkeys: true },
  })

  if (!user || user.passkeys.length === 0) {
    res.status(404).json({ error: 'No passkeys registered for this user' })
    return
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: user.passkeys.map((pk) => ({ id: pk.credential_id })),
    userVerification: 'preferred',
  })

  challengeStore.set(user.id, options.challenge)
  res.json(options)
})

// ── POST /auth/passkey/login/finish ───────────────────────────────────────────
router.post('/login/finish', async (req: Request, res: Response): Promise<void> => {
  const { email, response } = req.body as { email?: string; response?: Record<string, unknown> }

  if (!email || !response) {
    res.status(400).json({ error: 'email and response are required' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { passkeys: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const expectedChallenge = challengeStore.get(user.id)
  if (!expectedChallenge) {
    res.status(400).json({ error: 'Challenge not found — call /login/start first' })
    return
  }

  const passkey = user.passkeys.find(
    (pk) => pk.credential_id === (response as { id?: string }).id
  )
  if (!passkey) {
    res.status(400).json({ error: 'Passkey not found' })
    return
  }

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: response as unknown as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credential_id,
        publicKey: new Uint8Array(Buffer.from(passkey.public_key, 'base64')),
        counter: Number(passkey.counter),
      },
    })
  } catch (err) {
    res.status(400).json({ error: (err as Error).message })
    return
  }

  if (!verification.verified || !verification.authenticationInfo) {
    res.status(401).json({ error: 'Authentication failed' })
    return
  }

  await prisma.passkey.update({
    where: { credential_id: passkey.credential_id },
    data: { counter: verification.authenticationInfo.newCounter },
  })

  challengeStore.delete(user.id)

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token })
})

export default router
