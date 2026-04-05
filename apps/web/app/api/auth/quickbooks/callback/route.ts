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
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')

  if (!code) return new NextResponse('No code', { status: 400 })

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/quickbooks/callback`,
      client_id: process.env.QUICKBOOKS_CLIENT_ID ?? '',
      client_secret: process.env.QUICKBOOKS_CLIENT_SECRET ?? '',
    }),
  })

  if (!tokenRes.ok) {
    console.error('QuickBooks token exchange failed:', await tokenRes.text())
    return NextResponse.redirect(new URL('/settings?error=quickbooks_auth_failed', req.url))
  }

  const tokens = await tokenRes.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.redirect(new URL('/api/auth/signin', req.url))

  await prisma.connection.upsert({
    where: { id: `${user.id}-quickbooks` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      status: 'active',
    },
    create: {
      id: `${user.id}-quickbooks`,
      userId: user.id,
      provider: 'quickbooks',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      status: 'active',
    },
  })

  return NextResponse.redirect(new URL('/settings?connected=quickbooks', req.url))
}
