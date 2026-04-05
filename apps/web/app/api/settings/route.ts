import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { settings: true },
  })

  return NextResponse.json({
    settings: user?.settings ?? {
      defaultTone: 'friendly',
      timezone: 'America/New_York',
      emailFromName: 'Invoice Chase',
      reminderDays: 7,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      defaultTone: body.defaultTone ?? 'friendly',
      timezone: body.timezone ?? 'America/New_York',
      emailFromName: body.emailFromName ?? 'Invoice Chase',
      reminderDays: body.reminderDays ?? 7,
    },
    create: {
      userId: user.id,
      defaultTone: body.defaultTone ?? 'friendly',
      timezone: body.timezone ?? 'America/New_York',
      emailFromName: body.emailFromName ?? 'Invoice Chase',
      reminderDays: body.reminderDays ?? 7,
    },
  })

  return NextResponse.json({ settings })
}
