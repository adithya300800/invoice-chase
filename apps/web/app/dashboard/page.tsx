'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'
import { Modal } from '@/components/ui/Modal'

interface Invoice {
  id: string; clientName: string; invoiceNumber: string; amount: number
  dueDate: string; status: string; createdAt: string
}
interface Connection { provider: string; status: string }

export default function DashboardPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ clientName: '', invoiceNumber: '', amount: '', dueDate: '' })
  const PAGE_SIZE = 20

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setLoading(true)
    Promise.all([
      fetch('/api/invoices').then(r => r.json()),
      fetch('/api/connections').then(r => r.json()),
    ]).then(([invData, connData]) => {
      setInvoices(invData.invoices ?? [])
      setConnections(connData.connections ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  async function handleSync() {
    setSyncing(true)
    await fetch('/api/invoices/sync', { method: 'POST' })
    loadData()
    setSyncing(false)
  }

  async function handleAddInvoice(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    setShowAddModal(false)
    loadData()
  }

  const filtered = invoices.filter(i =>
    i.clientName.toLowerCase().includes(filter.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(filter.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalOverdue = invoices.reduce((s, i) => s + i.amount, 0)
  const gmailConnected = connections.some(c => c.provider === 'gmail')
  const qbConnected = connections.some(c => c.provider === 'quickbooks')

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}><div className={styles.logoIcon}>💸</div>Invoice Chase</div>
          <nav className={styles.nav}>
            <a href="/dashboard" className={styles.navItem + ' ' + styles.navActive}>📊 Dashboard</a>
            <a href="/clients" className={styles.navItem}>👥 Clients</a>
            <a href="/settings" className={styles.navItem}>⚙️ Settings</a>
          </nav>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div><h1>AR Dashboard</h1><p className={styles.sub}>Accounts receivable follow-up</p></div>
          <div className={styles.headerActions}>
            <button onClick={() => setShowAddModal(true)} className="btn btn-outline">+ Add Invoice</button>
            <button onClick={handleSync} disabled={syncing} className="btn btn-primary">
              {syncing ? '🔄 Syncing...' : '🔄 Sync QuickBooks'}
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total overdue</p>
            <p className={styles.statValue}>${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Overdue invoices</p>
            <p className={styles.statValue}>{invoices.length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Connections</p>
            <p className={styles.statValue}>{gmailConnected ? '📧' : '⚠️'} {qbConnected ? '📒' : '⚠️'}</p>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            placeholder="Filter by client or invoice #..."
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1) }}
            style={{ width: '100%', maxWidth: '400px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--text)', fontSize: '0.9rem' }}
          />
        </div>

        {/* Table */}
        {invoices.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>🎉 All caught up!</h2>
            <p>{qbConnected ? 'No overdue invoices. Connect QuickBooks to sync your AR.' : 'Connect QuickBooks to start tracking overdue invoices.'}</p>
            {!qbConnected && <a href="/settings" className="btn btn-primary">⚙️ Go to Settings</a>}
          </div>
        ) : paginated.length === 0 ? (
          <div className={styles.emptyState}><p>No matches for "{filter}"</p></div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr>
                  <th>Client</th><th>Invoice #</th><th>Amount</th><th>Due Date</th><th>Days Overdue</th><th>Draft</th>
                </tr></thead>
                <tbody>
                  {paginated.map(inv => {
                    const days = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000)
                    return (
                      <tr key={inv.id}>
                        <td className={styles.clientCell}>{inv.clientName}</td>
                        <td>{inv.invoiceNumber}</td>
                        <td className={styles.amountCell}>${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span className={days > 30 ? styles.dangerBadge : styles.warnBadge}>{days}d</span>
                        </td>
                        <td>
                          <a href={`/composer?invoice=${inv.id}`} className={styles.draftBtn}>✍️ Draft</a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>← Prev</button>
                <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Invoice Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Invoice Manually">
        <form onSubmit={handleAddInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Client name</label>
            <input required value={addForm.clientName} onChange={e => setAddForm(f => ({ ...f, clientName: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Invoice number</label>
            <input required value={addForm.invoiceNumber} onChange={e => setAddForm(f => ({ ...f, invoiceNumber: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Amount ($)</label>
            <input required type="number" step="0.01" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Due date</label>
            <input required type="date" value={addForm.dueDate} onChange={e => setAddForm(f => ({ ...f, dueDate: e.target.value }))}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Add Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
