import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64')

export async function GET(req: NextRequest) {
  const pixelId = req.nextUrl.searchParams.get('pixel_id')
  if (!pixelId) return new NextResponse('Not found', { status: 404 })

  try {
    const draftId = pixelId.replace('track_', '').split('_')[0]
    if (draftId) {
      // Record open (best effort)
      await prisma.sentLog.updateMany({
        where: { followUpDraftId: draftId },
        data: {}, // In production you'd add an `openedAt` field
      }).catch(() => {})
    }
  } catch {
    // Ignore tracking errors
  }

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
