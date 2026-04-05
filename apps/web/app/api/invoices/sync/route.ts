import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getARReport, parseARReport, refreshQBToken } from '@/lib/quickbooks'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { connections: { where: { provider: 'quickbooks', status: 'active' } } },
  })

  const qbConn = user?.connections[0]
  if (!qbConn) {
    return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 })
  }

  // Check token expiry
  let accessToken = qbConn.accessToken
  if (qbConn.expiresAt && new Date(qbConn.expiresAt) < new Date()) {
    const refreshed = await refreshQBToken({ accessToken, refreshToken: qbConn.refreshToken ?? '' })
    accessToken = refreshed.accessToken
    await prisma.connection.update({
      where: { id: qbConn.id },
      data: { accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt },
    })
  }

  // Get realmId from the connection (stored as refreshToken split or a separate field)
  const realmId = (qbConn.refreshToken ?? '').split('|')[0] || process.env.QUICKBOOKS_REALM_ID ?? ''

  let synced = 0
  let totalAmount = 0

  try {
    const report = await getARReport(accessToken, realmId)
    const invoices = parseARReport(report)

    for (const inv of invoices) {
      if (!inv.DocNumber || inv.Balance <= 0) continue
      const dueDate = new Date(inv.DueDate)
      if (dueDate > new Date()) continue // not yet overdue

      await prisma.invoice.upsert({
        where: {
          id: `${user!.id}-${inv.DocNumber}`
        },
        update: {
          status: 'overdue',
          amount: inv.Balance,
          dueDate,
        },
        create: {
          id: `${user!.id}-${inv.DocNumber}`,
          userId: user!.id,
          clientName: inv.CustomerName,
          invoiceNumber: inv.DocNumber,
          amount: inv.Balance,
          issueDate: new Date(inv.TxnDate),
          dueDate,
          status: 'overdue',
          quickbooksId: inv.CustomerId,
        },
      })
      synced++
      totalAmount += inv.Balance
    }
  } catch (err) {
    console.error('QB sync error:', err)
    return NextResponse.json({ error: 'Sync failed', detail: String(err) }, { status: 500 })
  }

  return NextResponse.json({ synced, totalAmount })
}
