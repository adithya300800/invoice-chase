import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  if (!user?.subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return NextResponse.json({ url: portal.url })
}
