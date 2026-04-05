import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { draftId, subject, body, recipientEmail } = await req.json()
  if (!draftId) return NextResponse.json({ error: 'draftId required' }, { status: 400 })

  const draft = await prisma.followUpDraft.findUnique({
    where: { id: draftId },
    include: { invoice: { include: { user: true } } },
  })

  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  if (draft.invoice.user.email !== session.user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (draft.status === 'sent') {
    return NextResponse.json({ error: 'Already sent' }, { status: 400 })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const emailTo = recipientEmail ?? draft.invoice.clientName
  const trackingId = `track_${draftId}_${Date.now()}`

  // Send via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL ?? 'Invoice Chase <chase@invoicechase.app>',
      to: [emailTo],
      subject: subject ?? draft.subject,
      html: `<p>${(body ?? draft.emailBody).replace(/\n/g, '<br>')}</p><img src="${process.env.NEXT_PUBLIC_APP_URL}/api/tracking?pixel_id=${trackingId}" width="1" height="1" />`,
      text: body ?? draft.emailBody,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    return NextResponse.json({ error: 'Failed to send email', detail: err }, { status: 500 })
  }

  const sentAt = new Date()

  await prisma.followUpDraft.update({
    where: { id: draftId },
    data: { status: 'sent', sentAt },
  })

  await prisma.sentLog.upsert({
    where: { followUpDraftId: draftId },
    update: { recipientEmail: emailTo, sentAt },
    create: {
      followUpDraftId: draftId,
      recipientEmail: emailTo,
      sentAt,
    },
  })

  return NextResponse.json({ success: true, sentAt: sentAt.toISOString() })
}
