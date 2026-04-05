import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=qb_no_code', request.url))
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Exchange code for access token (QuickBooks token exchange)
  // In production, this would call QuickBooks token endpoint
  // For now, store the code as a placeholder
  try {
    await prisma.connection.upsert({
      where: {
        userId_provider: { userId: user.id, provider: 'quickbooks' },
      },
      update: {
        accessToken: code,
        realmId: realmId ?? '',
        status: 'active',
      },
      create: {
        userId: user.id,
        provider: 'quickbooks',
        accessToken: code,
        refreshToken: '',
        realmId: realmId ?? '',
        status: 'active',
      },
    })
  } catch (err) {
    console.error('Failed to save QuickBooks connection:', err)
    return NextResponse.redirect(new URL('/dashboard?error=qb_save_failed', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard?connected=quickbooks', request.url))
}
