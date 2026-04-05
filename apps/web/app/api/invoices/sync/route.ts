import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

async function syncFromQuickBooks(userId: string) {
  const connection = await prisma.connection.findFirst({
    where: { userId, provider: 'quickbooks' },
    orderBy: { createdAt: 'desc' },
  })

  if (!connection) {
    return { error: 'No QuickBooks connection found' }
  }

  const accessToken = connection.accessToken ?? ''
  const realmId = connection.realmId ?? ''

  // Fetch AR Aging report from QuickBooks
  const response = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/AccountsReceivableAging`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    return { error: `QuickBooks API error: ${response.status}` }
  }

  const data = await response.json()
  const rows = data?.Rows?.Row ?? []
  let synced = 0
  let totalAmount = 0

  for (const row of rows) {
    if (row.type !== 'Data') continue
    const cells = row.Col_Data?.Col_data ?? []

    const clientName = cells[0]?.value ?? 'Unknown'
    const totalDue = parseFloat(cells[1]?.value ?? '0')
    const invoiceNumber = cells[2]?.value ?? `QB-${Date.now()}`
    const dueDateStr = cells[3]?.value ?? ''
    const status = cells[4]?.value ?? 'overdue'

    const dueDate = dueDateStr ? new Date(dueDateStr) : new Date()
    const today = new Date()
    const isOverdue = dueDate < today

    if (isOverdue && totalDue > 0) {
      await prisma.invoice.upsert({
        where: {
          userId_invoiceNumber: { userId, invoiceNumber },
        },
        update: {
          clientName,
          amount: totalDue,
          dueDate,
          status: 'overdue',
          connectionId: connection.id,
        },
        create: {
          userId,
          invoiceNumber,
          clientName,
          amount: totalDue,
          dueDate,
          status: 'overdue',
          connectionId: connection.id,
        },
      })
      synced++
      totalAmount += totalDue
    }
  }

  return { synced, total: synced, totalAmount }
}

async function syncFromGmail(userId: string) {
  // Gmail invoice parsing - look for invoice emails in sent folder
  // This would use Gmail API to fetch recent sent emails and parse for invoice data
  // For now, return a placeholder indicating this feature
  return { synced: 0, total: 0, totalAmount: 0, note: 'Gmail sync not yet configured' }
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Try QuickBooks sync
  const qbResult = await syncFromQuickBooks(user.id)

  if (qbResult.error) {
    return NextResponse.json(qbResult, { status: 400 })
  }

  return NextResponse.json({
    synced: qbResult.synced,
    total: qbResult.total,
    totalAmount: qbResult.totalAmount,
    provider: 'quickbooks',
  })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Return current invoice count and total overdue
  const overdueInvoices = await prisma.invoice.findMany({
    where: { userId: user.id, status: 'overdue' },
  })

  const totalAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return NextResponse.json({
    totalOverdue: overdueInvoices.length,
    totalAmount,
    lastSynced: null,
  })
}
