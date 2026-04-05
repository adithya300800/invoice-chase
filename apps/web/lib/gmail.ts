export async function getGmailMessages(accessToken: string, query: string = 'subject:invoice') {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
    {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    }
  )
  if (!res.ok) throw new Error(`Gmail API failed: ${await res.text()}`)
  const data = await res.json()
  return data.messages ?? []
}

export interface ParsedInvoice {
  invoiceNumber: string
  clientName: string
  amount: number
  issueDate: string
  dueDate: string
  email: string
}

const INVOICE_NUMBER_RE = /invoice\s*#?\s*[:.]?\s*([A-Z0-9-]+)/i
const AMOUNT_RE = /\$[\d,]+\.?\d*/i
const DATE_RE = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/

export function parseInvoiceEmail(body: string, fromEmail: string): Partial<ParsedInvoice> {
  const invoiceNumber = (body.match(INVOICE_NUMBER_RE)?.[1] ?? '').trim()
  const amountMatch = body.match(AMOUNT_RE)
  const amount = amountMatch ? parseFloat(amountMatch[0].replace('$', '').replace(/,/g, '')) : 0
  const dateMatch = body.match(DATE_RE)
  const issueDate = dateMatch ? dateMatch[1] : ''
  return { invoiceNumber, amount, email: fromEmail, issueDate, dueDate: issueDate, clientName: fromEmail.split('@')[0] }
}
