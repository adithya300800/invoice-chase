import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      invoices: {
        where: { status: 'overdue' },
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  return NextResponse.json({ invoices: user?.invoices ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { clientName, invoiceNumber, amount, issueDate, dueDate, quickbooksId } = body

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientName,
      invoiceNumber,
      amount: parseFloat(amount),
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      status: 'pending',
      quickbooksId,
    },
  })

  return NextResponse.json({ invoice })
}
