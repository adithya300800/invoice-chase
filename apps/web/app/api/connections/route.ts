import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { connections: true },
  })

  return NextResponse.json({
    connections: user?.connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      status: c.status,
      createdAt: c.createdAt,
    })) ?? [],
  })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { connectionId } = await req.json()
  if (!connectionId) return NextResponse.json({ error: 'connectionId required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const conn = await prisma.connection.findUnique({ where: { id: connectionId } })
  if (!conn || conn.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.connection.update({ where: { id: connectionId }, data: { status: 'revoked' } })

  return NextResponse.json({ success: true })
}
