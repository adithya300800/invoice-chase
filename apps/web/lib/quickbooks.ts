import { Prisma } from '@prisma/client'

const QB_BASE = 'https://quickbooks.api.intuit.com/v3'
const QB_OAUTH = 'https://oauth.platform.intuit.com/oauth2/v1'

export async function refreshQBToken(connection: {
  accessToken: string
  refreshToken: string
}): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const res = await fetch(`${QB_OAUTH}/tokens/bearer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
      client_id: process.env.QUICKBOOKS_CLIENT_ID ?? '',
      client_secret: process.env.QUICKBOOKS_CLIENT_SECRET ?? '',
    }),
  })
  if (!res.ok) throw new Error(`QB refresh failed: ${await res.text()}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

export async function getARReport(accessToken: string, realmId: string) {
  const res = await fetch(
    `${QB_BASE}/company/${realmId}/reports/AccountsReceivableAging?date=${new Date().toISOString().split('T')[0]}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`QB AR report failed: ${await res.text()}`)
  return res.json()
}

export interface QBInvoice {
  DocNumber: string
  CustomerName: string
  TotalAmt: number
  TxnDate: string
  DueDate: string
  Balance: number
  CustomerId: string
}

export function parseARReport(report: {
  Rows?: { Row?: Array<{ ColData?: Array<{ value?: string }> }> }
}): QBInvoice[] {
  const invoices: QBInvoice[] = []
  const rows = report?.Rows?.Row ?? []
  for (const row of rows) {
    const cols = row?.ColData ?? []
    if (cols.length < 5) continue
    invoices.push({
      DocNumber: cols[0]?.value ?? '',
      CustomerName: cols[1]?.value ?? '',
      TotalAmt: parseFloat(cols[2]?.value ?? '0'),
      TxnDate: cols[3]?.value ?? '',
      DueDate: cols[4]?.value ?? '',
      Balance: parseFloat(cols[5]?.value ?? '0'),
      CustomerId: cols.length > 6 ? cols[6]?.value ?? '' : '',
    })
  }
  return invoices
}
