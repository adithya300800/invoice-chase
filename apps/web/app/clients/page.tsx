'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ClientData {
  name: string
  email: string | null
  totalOwed: number
  overdueCount: number
  oldestOverdue: string | null
  invoices: any[]
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        // Enhance with invoice data
        const clientData = await Promise.all(data.map(async (c: any) => {
          const invRes = await fetch(`/api/invoices?client=${encodeURIComponent(c.name)}`)
          const invoices = invRes.ok ? await invRes.json() : []
          const overdueInvoices = invoices.filter((i: any) => i.status === 'overdue')
          return {
            name: c.name,
            email: c.email,
            totalOwed: overdueInvoices.reduce((s: number, i: any) => s + i.amount, 0),
            overdueCount: overdueInvoices.length,
            oldestOverdue: overdueInvoices.length > 0
              ? overdueInvoices.reduce((a: any, b: any) => new Date(a.dueDate) < new Date(b.dueDate) ? a : b).dueDate
              : null,
            invoices: overdueInvoices,
          }
        }))
        setClients(clientData)
      }
    } catch (err) { console.error('Failed to load clients:', err) }
    finally { setLoading(false) }
  }

  async function markPaid(invoiceId: string) {
    await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    })
    loadClients()
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(filter.toLowerCase()))
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading clients...</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Clients</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{clients.length} clients with overdue invoices</p>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter clients..."
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem', color: 'var(--text)', fontSize: '0.9rem', width: 240 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>No clients yet</h2>
          <p style={{ fontSize: '0.9rem' }}>Add invoices and they will appear here grouped by client.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(client => (
            <div key={client.name} className="client-card" onClick={() => setSelectedClient(selectedClient?.name === client.name ? null : client)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="client-avatar">{client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>{client.name}</div>
                  {client.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.email}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Owed</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: client.totalOwed > 0 ? 'var(--accent)' : '#22c55e' }}>${client.totalOwed.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Overdue</div>
                  <div style={{ fontWeight: 700, color: client.overdueCount > 0 ? '#ef4444' : '#22c55e' }}>{client.overdueCount} invoice{client.overdueCount !== 1 ? 's' : ''}</div>
                </div>
                {client.oldestOverdue && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Oldest</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(client.oldestOverdue).toLocaleDateString()}</div>
                  </div>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{selectedClient?.name === client.name ? '▲' : '▼'}</div>
              </div>

              {selectedClient?.name === client.name && (
                <div style={{ width: '100%', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Invoice</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Due Date</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Days Overdue</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.invoices.map((inv: any) => {
                        const today = new Date()
                        const due = new Date(inv.dueDate)
                        const days = Math.floor((today.getTime() - due.getTime()) / 86400000)
                        return (
                          <tr key={inv.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.9rem' }}>
                            <td style={{ padding: '0.6rem 0' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '0.6rem 0', fontWeight: 600, color: 'var(--accent)' }}>${inv.amount.toFixed(2)}</td>
                            <td style={{ padding: '0.6rem 0' }}>{due.toLocaleDateString()}</td>
                            <td style={{ padding: '0.6rem 0', color: days > 30 ? '#ef4444' : days > 14 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{days}d</td>
                            <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>
                              <button onClick={() => router.push(`/composer/${inv.id}`)} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>Follow-up</button>
                              <button onClick={() => markPaid(inv.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Mark Paid</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}