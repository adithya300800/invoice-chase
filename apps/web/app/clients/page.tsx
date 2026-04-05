'use client'
import { useState, useEffect } from 'react'
import styles from '../dashboard/dashboard.module.css'

interface Client {
  name: string
  total: number
  count: number
  oldestDue: string | null
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => {
      setClients(d.clients ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className={styles.layout}><main className={styles.main}><p>Loading...</p></main></div>

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}><div className={styles.logoIcon}>💸</div>Invoice Chase</div>
          <nav className={styles.nav}>
            <a href="/dashboard" className={styles.navItem}>📊 Dashboard</a>
            <a href="/clients" className={styles.navItem + ' ' + styles.navActive}>👥 Clients</a>
            <a href="/settings" className={styles.navItem}>⚙️ Settings</a>
          </nav>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <div><h1>Clients</h1><p className={styles.sub}>{clients.length} clients with overdue invoices</p></div>
        </header>
        {clients.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No clients yet</h2>
            <p>Connect QuickBooks to import your client list.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {clients.map(client => (
              <div key={client.name} className="client-card" onClick={() => setExpanded(expanded === client.name ? null : client.name)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="client-avatar">{client.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontWeight: 700 }}>{client.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.count} overdue invoice{client.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>${client.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  {client.oldestDue && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Oldest: {new Date(client.oldestDue).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
