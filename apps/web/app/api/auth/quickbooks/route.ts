import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Initiate QuickBooks OAuth — redirects to Intuit consent screen
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const realmId = req.nextUrl.searchParams.get('realmId')
  const state = JSON.stringify({ email: session.user.email, realmId })

  const params = new URLSearchParams({
    client_id: process.env.QUICKBOOKS_CLIENT_ID ?? '',
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/quickbooks/callback`,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    state,
  })

  return NextResponse.redirect(`https://appcenter.intuit.com/connect/oauth2?${params}`)
}
