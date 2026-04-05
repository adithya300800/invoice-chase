import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId, tone = 'friendly' } = await req.json()

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))

  const toneInstructions = {
    friendly: 'warm, casual, not pushy — like a colleague reminding you of a friendly favor',
    firm: 'direct, professional, clear — state the overdue amount and request payment within 7 days',
    formal: 'official, polite, business-appropriate — suitable for formal AR communications',
  }

  const prompt = `You are an accounts receivable assistant helping a small business owner follow up on an overdue invoice.

Invoice details:
- Client: ${invoice.clientName}
- Invoice number: ${invoice.invoiceNumber}
- Amount: $${invoice.amount.toFixed(2)}
- Due date: ${new Date(invoice.dueDate).toLocaleDateString()}
- Days overdue: ${daysOverdue}

Write a ${tone} follow-up email. The tone should be ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.friendly}.

Requirements:
- Subject line starts with "Invoice ${invoice.invoiceNumber} — "
- Email body is 3-5 sentences max
- Include the invoice number and amount in the email
- Do NOT fabricate payment links or phone numbers
- End with a clear but polite call to action (pay online, reply with questions, etc.)
- No aggressive tone

Return as JSON:
{
  "subject": "subject line here",
  "body": "email body here"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content ?? ''
    const jsonMatch = content.match(/\{[\s\S]*?\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { subject: `Invoice ${invoice.invoiceNumber} — Follow-up`, body: content }

    const draft = await prisma.followUpDraft.create({
      data: {
        invoiceId: invoice.id,
        emailBody: parsed.body,
        subject: parsed.subject,
        tone,
        status: 'draft',
      },
    })

    return NextResponse.json({ draft })
  } catch (error: unknown) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}
