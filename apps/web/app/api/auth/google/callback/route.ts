import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { googleAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Store the connection for later use
  // The actual OAuth flow is handled by NextAuth
  return NextResponse.redirect(new URL('/dashboard?connected=google', request.url))
}
