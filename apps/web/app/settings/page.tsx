import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import styles from '../dashboard/dashboard.module.css'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/api/auth/signin')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { connections: true },
  })

  const gmailConn = user?.connections.find((c) => c.provider === 'gmail')
  const qbConn = user?.connections.find((c) => c.provider === 'quickbooks')

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>💸</div>
            Invoice Chase
          </div>
          <nav className={styles.nav}>
            <a href="/dashboard" className={styles.navItem}>📊 Dashboard</a>
            <a href="/settings" className={styles.navItem + ' ' + styles.navActive}>⚙️ Settings</a>
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <p className={styles.userEmail}>{session.user?.email}</p>
          <a href="/api/auth/signout" className={styles.signOut}>Sign out</a>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Settings</h1>
            <p className={styles.sub}>Connect your accounts and configure your preferences</p>
          </div>
        </header>

        {/* Gmail connection */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>📧</div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Gmail</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connect to read your sent invoices and send follow-ups</p>
            </div>
            {gmailConn ? (
              <span style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                ✅ Connected
              </span>
            ) : (
              <a href="/api/auth/google" style={{ marginLeft: 'auto' }} className="btn btn-outline">Connect Gmail →</a>
            )}
          </div>
        </div>

        {/* QuickBooks connection */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>📒</div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>QuickBooks Online</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connect to pull your AR aging report and invoice data</p>
            </div>
            {qbConn ? (
              <span style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                ✅ Connected
              </span>
            ) : (
              <a href="/api/auth/quickbooks" style={{ marginLeft: 'auto' }} className="btn btn-outline">Connect QuickBooks →</a>
            )}
          </div>
        </div>

        {/* Email tone preference */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Default email tone</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Choose the tone for AI-generated follow-up drafts</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['friendly', 'firm', 'formal'].map((tone) => (
              <a key={tone} href={`/api/settings/tone?value=${tone}`}
                className="btn btn-outline"
                style={{ textTransform: 'capitalize' }}>
                {tone}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
