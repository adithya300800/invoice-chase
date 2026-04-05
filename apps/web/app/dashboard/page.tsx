'use client'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string | null
  amount: number
  dueDate: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 20

  // Filters
  const [filterClient, setFilterClient] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterAmountMin, setFilterAmountMin] = useState('')
  const [filterAmountMax, setFilterAmountMax] = useState('')

  // New invoice form
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: '', clientName: '', clientEmail: '', amount: '', dueDate: '' })

  // Stats
  const [stats, setStats] = useState({ totalOverdue: 0, countOverdue: 0, recoveredThisMonth: 0, activeConnections: 0 })

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const [invRes, syncRes, connRes] = await Promise.all([
        fetch('/api/invoices?status=overdue'),
        fetch('/api/invoices/sync'),
        fetch('/api/connections'),
      ])
      if (invRes.ok) { const data = await invRes.json(); setInvoices(data) }
      if (syncRes.ok) { const data = await syncRes.json(); setStats(s => ({ ...s, totalOverdue: data.totalAmount, countOverdue: data.totalOverdue })) }
      if (connRes.ok) { const data = await connRes.json(); setStats(s => ({ ...s, activeConnections: data.length })) }
    } catch (err) { console.error('Failed to load dashboard:', err) }
    finally { setLoading(false) }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/invoices/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setToast({ message: `Synced ${data.synced} invoices from QuickBooks!`, type: 'success' })
        loadDashboard()
      } else {
        const err = await res.json()
        setToast({ message: err.error || 'Sync failed', type: 'error' })
      }
    } catch { setToast({ message: 'Sync failed', type: 'error' }) }
    finally { setSyncing(false) }
  }

  async function handleAddInvoice(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newInvoice, amount: parseFloat(newInvoice.amount), status: 'overdue' }),
      })
      if (res.ok) {
        setToast({ message: 'Invoice added!', type: 'success' })
        setShowAddModal(false)
        setNewInvoice({ invoiceNumber: '', clientName: '', clientEmail: '', amount: '', dueDate: '' })
        loadDashboard()
      } else setToast({ message: 'Failed to add invoice', type: 'error' })
    } catch { setToast({ message: 'Failed to add invoice', type: 'error' }) }
  }

  async function handleMarkPaid(invoiceId: string) {
    await fetch(`/api/invoices/${invoiceId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }) })
    setToast({ message: 'Invoice marked as paid!', type: 'success' })
    loadDashboard()
  }

  const today = new Date()
  const filtered = invoices.filter(inv => {
    if (filterClient && !inv.clientName.toLowerCase().includes(filterClient.toLowerCase())) return false
    if (filterDateFrom && new Date(inv.dueDate) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(inv.dueDate) > new Date(filterDateTo)) return false
    if (filterAmountMin && inv.amount < parseFloat(filterAmountMin)) return false
    if (filterAmountMax && inv.amount > parseFloat(filterAmountMax)) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const statCards = [
    { label: 'Total Overdue', value: `$${stats.totalOverdue.toFixed(2)}`, color: '#ef4444', icon: '💰' },
    { label: '# Overdue Invoices', value: stats.countOverdue.toString(), color: '#f59e0b', icon: '📋' },
    { label: 'Recovered This Month', value: `$${stats.recoveredThisMonth.toFixed(2)}`, color: '#22c55e', icon: '✅' },
    { label: 'Active Connections', value: stats.activeConnections.toString(), color: '#6366f1', icon: '🔗' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading dashboard...</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(card => (
          <div key={card.label} className="billing-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{card.label}</span>
              <span style={{ fontSize: '1.4rem' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleSync} disabled={syncing}
          style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--accent)', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {syncing ? '⟳ Syncing...' : '⟳ Sync from QuickBooks'}
        </button>
        <button onClick={() => setShowAddModal(true)}
          style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
          + Add Invoice Manually
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={filterClient} onChange={e => { setFilterClient(e.target.value); setCurrentPage(1) }} placeholder="Filter by client..."
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.85rem', width: 160 }} />
        <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setCurrentPage(1) }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.85rem' }} />
        <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setCurrentPage(1) }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.85rem' }} />
        <input type="number" value={filterAmountMin} onChange={e => { setFilterAmountMin(e.target.value); setCurrentPage(1) }} placeholder="Min $"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.85rem', width: 100 }} />
        <input type="number" value={filterAmountMax} onChange={e => { setFilterAmountMax(e.target.value); setCurrentPage(1) }} placeholder="Max $"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.85rem', width: 100 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No overdue invoices</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sync from QuickBooks or add invoices manually to get started.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Invoice #', 'Amount', 'Due', 'Days Overdue', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(inv => {
                const due = new Date(inv.dueDate)
                const days = Math.floor((today.getTime() - due.getTime()) / 86400000)
                const isPaid = inv.status === 'paid'
                const statusColor = isPaid ? '#22c55e' : days > 30 ? '#ef4444' : days > 14 ? '#f59e0b' : '#f59e0b'
                const statusLabel = isPaid ? 'Paid' : days > 30 ? 'Critical' : days > 14 ? 'At Risk' : 'Overdue'
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{inv.clientName}</div>
                      {inv.clientEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.clientEmail}</div>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent)' }}>${inv.amount.toFixed(2)}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>{due.toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: statusColor }}>{days}d</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: `${statusColor}20`, color: statusColor }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {!isPaid && (
                        <button onClick={() => window.location.href = `/composer/${inv.id}`}
                          style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>Draft Follow-Up</button>
                      )}
                      <button onClick={() => handleMarkPaid(inv.id)} disabled={isPaid}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: isPaid ? '1px solid var(--border)' : '1px solid rgba(34,197,94,0.3)', background: isPaid ? 'transparent' : 'rgba(34,197,94,0.1)', color: isPaid ? 'var(--text-muted)' : '#22c55e', cursor: isPaid ? 'default' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        {isPaid ? '✓ Paid' : 'Mark Paid'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: currentPage === 1 ? 'default' : 'pointer', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text)', fontSize: '0.85rem' }}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: currentPage === totalPages ? 'default' : 'pointer', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text)', fontSize: '0.85rem' }}>Next →</button>
        </div>
      )}

      {/* Add Invoice Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Invoice Manually">
        <form onSubmit={handleAddInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Invoice Number *</label>
            <input required value={newInvoice.invoiceNumber} onChange={e => setNewInvoice(n => ({ ...n, invoiceNumber: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Client Name *</label>
            <input required value={newInvoice.clientName} onChange={e => setNewInvoice(n => ({ ...n, clientName: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Client Email</label>
            <input type="email" value={newInvoice.clientEmail} onChange={e => setNewInvoice(n => ({ ...n, clientEmail: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Amount *</label>
              <input required type="number" step="0.01" value={newInvoice.amount} onChange={e => setNewInvoice(n => ({ ...n, amount: e.target.value }))}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Due Date *</label>
              <input required type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice(n => ({ ...n, dueDate: e.target.value }))}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>Add Invoice</button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}