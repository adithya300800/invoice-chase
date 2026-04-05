import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  })

  if (!settings) {
    // Return defaults
    return NextResponse.json({
      defaultTone: 'friendly',
      timezone: 'America/New_York',
      emailFromName: 'Invoice Chase',
      reminderDays: 7,
    })
  }

  return NextResponse.json(settings)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { defaultTone, timezone, emailFromName, reminderDays } = body

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      ...(defaultTone && { defaultTone }),
      ...(timezone && { timezone }),
      ...(emailFromName && { emailFromName }),
      ...(reminderDays !== undefined && { reminderDays }),
    },
    create: {
      userId: session.user.id,
      defaultTone: defaultTone ?? 'friendly',
      timezone: timezone ?? 'America/New_York',
      emailFromName: emailFromName ?? 'Invoice Chase',
      reminderDays: reminderDays ?? 7,
    },
  })

  return NextResponse.json(settings)
}
