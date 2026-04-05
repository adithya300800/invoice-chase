import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  const sub = user?.subscription
  return NextResponse.json({
    plan: sub?.plan ?? 'free',
    status: sub?.status ?? 'active',
    currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
    trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Get or create Stripe customer
  let customerId = user.subscription?.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined })
    customerId = customer.id
    // Create or update subscription record (free tier)
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: '',
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Create checkout session for $149/mo
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: 'price_monthly_149', quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: checkout.url })
}
