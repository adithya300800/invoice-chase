import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 1x1 transparent GIF base64
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pixelId = searchParams.get('pixel_id')

  if (!pixelId) {
    return new NextResponse('Missing pixel_id', { status: 400 })
  }

  try {
    const sentLog = await prisma.sentLog.findUnique({
      where: { id: pixelId },
    })

    if (sentLog) {
      await prisma.sentLog.update({
        where: { id: pixelId },
        data: { opens: { increment: 1 } },
      })
    }
  } catch (err) {
    // Don't fail the tracking pixel for DB errors
    console.error('Tracking pixel error:', err)
  }

  return new NextResponse(TRANSPARENT_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
