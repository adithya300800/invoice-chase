import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { draftId } = body

  if (!draftId) {
    return NextResponse.json({ error: 'draftId is required' }, { status: 400 })
  }

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { invoice: true },
  })

  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  if (draft.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const invoice = draft.invoice
  const clientEmail = invoice?.clientEmail ?? ''

  if (!clientEmail) {
    return NextResponse.json({ error: 'No client email address' }, { status: 400 })
  }

  // Send email via Resend
  const sentAt = new Date()
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? 'Invoice Chase <chase@invoicechase.app>',
      to: clientEmail,
      subject: draft.subject,
      html: draft.body.replace(/\n/g, '<br>'),
    })
  } catch (emailError) {
    console.error('Failed to send email:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Record in SentLog
  const sentLog = await prisma.sentLog.create({
    data: {
      userId: session.user.id,
      invoiceId: invoice?.id,
      draftId: draft.id,
      sentAt,
      recipientEmail: clientEmail,
      subject: draft.subject,
      opens: 0,
      clicks: 0,
    },
  })

  // Update draft status
  await prisma.draft.update({
    where: { id: draftId },
    data: { status: 'sent', sentAt },
  })

  return NextResponse.json({
    success: true,
    sentAt: sentAt.toISOString(),
    sentLogId: sentLog.id,
  })
}
