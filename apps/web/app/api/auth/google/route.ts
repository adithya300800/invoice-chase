import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Initiate Google OAuth — redirects to Google consent screen
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
