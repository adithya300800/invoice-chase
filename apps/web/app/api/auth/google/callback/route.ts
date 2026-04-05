import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return new NextResponse('No code', { status: 400 })

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) {
    console.error('Google token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/settings?error=google_auth_failed', req.url))
  }
  const tokens = await tokenRes.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.redirect(new URL('/api/auth/signin', req.url))

  await prisma.connection.upsert({
    where: { id: `${user.id}-gmail` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      status: 'active',
    },
    create: {
      id: `${user.id}-gmail`,
      userId: user.id,
      provider: 'gmail',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      status: 'active',
    },
  })

  return NextResponse.redirect(new URL('/settings?connected=gmail', req.url))
}
