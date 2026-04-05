import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get unique client names from invoices for this user
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    select: { clientName: true, clientEmail: true },
    distinct: ['clientName'],
  })

  const clients = invoices.map(inv => ({
    name: inv.clientName,
    email: inv.clientEmail,
  }))

  return NextResponse.json(clients)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email } = body

  if (!name) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      userId: session.user.id,
      name,
      email: email ?? null,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
