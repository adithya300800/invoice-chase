import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/api/auth/signin')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      connections: { where: { status: 'active' } },
      invoices: {
        where: { status: 'overdue' },
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  const totalOverdue = user?.invoices.reduce((sum, inv) => sum + inv.amount, 0) ?? 0
  const connectionCount = user?.connections.length ?? 0

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>💸</div>
            Invoice Chase
          </div>
          <nav className={styles.nav}>
            <a href="/dashboard" className={styles.navItem + ' ' + styles.navActive}>📊 Dashboard</a>
            <a href="/settings" className={styles.navItem}>⚙️ Settings</a>
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <p className={styles.userEmail}>{session.user?.email}</p>
          <a href="/api/auth/signout" className={styles.signOut}>Sign out</a>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>AR Dashboard</h1>
            <p className={styles.sub}>Accounts receivable follow-up</p>
          </div>
          <div className={styles.headerActions}>
            <a href="/settings" className="btn btn-outline">⚙️ Connections</a>
            <button className="btn btn-primary">🔄 Sync invoices</button>
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
            <p className={styles.statValue}>{user?.invoices.length ?? 0}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Connections</p>
            <p className={styles.statValue}>{connectionCount}/2</p>
          </div>
        </div>

        {/* Invoice table */}
        {user?.connections.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Connect your accounts</h2>
            <p>Link Gmail and QuickBooks to start finding overdue invoices.</p>
            <a href="/settings" className="btn btn-primary">⚙️ Go to Settings</a>
          </div>
        ) : user?.invoices.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>🎉 No overdue invoices!</h2>
            <p>All caught up. Come back when you have overdue invoices.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Draft Follow-Up</th>
                </tr>
              </thead>
              <tbody>
                {user?.invoices.map((inv) => {
                  const daysOverdue = Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={inv.id}>
                      <td className={styles.clientCell}>{inv.clientName}</td>
                      <td>{inv.invoiceNumber}</td>
                      <td className={styles.amountCell}>${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={daysOverdue > 30 ? styles.dangerBadge : styles.warnBadge}>
                          {daysOverdue}d
                        </span>
                      </td>
                      <td>
                        <form action={`/api/drafts?invoiceId=${inv.id}`} method="POST">
                          <button type="submit" className={styles.draftBtn}>✍️ Draft</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
