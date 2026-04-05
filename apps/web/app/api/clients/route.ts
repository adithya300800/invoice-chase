import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      invoices: {
        where: { status: 'overdue' },
        include: { client: true },
      },
    },
  })

  // Group by client name
  const clientMap = new Map<string, { name: string; total: number; count: number; oldestDue: string | null }>()
  for (const inv of user?.invoices ?? []) {
    const name = inv.client?.name ?? inv.clientName
    const existing = clientMap.get(name) ?? { name, total: 0, count: 0, oldestDue: null }
    existing.total += inv.amount
    existing.count++
    if (!existing.oldestDue || inv.dueDate < new Date(existing.oldestDue)) {
      existing.oldestDue = inv.dueDate.toISOString()
    }
    clientMap.set(name, existing)
  }

  return NextResponse.json({ clients: Array.from(clientMap.values()) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const client = await prisma.client.create({
    data: { userId: user.id, name, email },
  })

  return NextResponse.json({ client })
}
