import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const invoiceId = searchParams.get('invoiceId')
  if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })
  const drafts = await prisma.followUpDraft.findMany({
    where: { invoiceId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ drafts })
}
