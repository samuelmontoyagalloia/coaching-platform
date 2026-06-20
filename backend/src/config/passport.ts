import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { randomUUID } from 'crypto'
import prisma from '../lib/prisma.js'

const IS_PROD = process.env.NODE_ENV === 'production'
const callbackBase =
  !IS_PROD && process.env.TUNNEL_URL
    ? process.env.TUNNEL_URL
    : (process.env.BACKEND_URL ?? 'http://localhost:3001')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${callbackBase}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('No email provided by Google'))

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          // Link to a Client with the same email if one exists
          const client = await prisma.client.findUnique({ where: { email } })

          user = await prisma.user.create({
            data: {
              id: randomUUID(),
              email,
              client_id: client?.id ?? null,
            },
          })
        }

        return done(null, { userId: user.id })
      } catch (err) {
        return done(err as Error)
      }
    }
  )
)

export default passport
