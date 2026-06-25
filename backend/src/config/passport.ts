import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import prisma from '../lib/prisma.js'

const IS_PROD = process.env.NODE_ENV === 'production'
const callbackBase =
  !IS_PROD && process.env.TUNNEL_URL
    ? process.env.TUNNEL_URL
    : (process.env.BACKEND_URL ?? 'http://localhost:3000')

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
        console.log('[passport] Google callback — email recibido:', email)
        if (!email) return done(new Error('No email provided by Google'))

        const client = await prisma.client.findUnique({ where: { email } })
        console.log('[passport] Client lookup result:', client ? `encontrado id=${client.id}` : 'NO ENCONTRADO → access_denied')
        if (!client) return done(null, false, { message: 'access_denied' })

        const name      = profile.displayName ?? null
        const photo_url = profile.photos?.[0]?.value ?? null

        let user = await prisma.user.findUnique({ where: { email } })
        console.log('[passport] User lookup result:', user ? `encontrado id=${user.id}` : 'nuevo usuario, creando...')

        if (!user) {
          user = await prisma.user.create({
            data: { email, name, photo_url, client_id: client.id },
          })
          console.log('[passport] Usuario creado:', user.id)
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name, photo_url, ...(!user.client_id && { client_id: client.id }) },
          })
          console.log('[passport] Usuario actualizado:', user.id)
        }

        return done(null, { userId: user.id, role: user.role })
      } catch (err) {
        console.error('[passport] Error inesperado:', err)
        return done(err as Error)
      }
    }
  )
)

export default passport
