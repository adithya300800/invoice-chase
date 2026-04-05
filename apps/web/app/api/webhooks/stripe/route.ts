import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const plan = sub.items.data[0]?.price?.nickname?.toLowerCase() ?? 'monthly'
        const status = sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'canceled'
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            plan,
            status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { status: 'canceled', plan: 'free' },
        })
        break
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: session.customer as string },
            data: {
              stripeSubscriptionId: sub.id,
              status: 'active',
              plan: 'monthly',
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          })
        }
        break
      }
      default:
        console.log('Unhandled Stripe event:', event.type)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
