import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>💸</span> Invoice Chase
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign in</Link>
          <Link href="/register" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Start free trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          🚀 Used by 47 bookkeepers and freelancers
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--text), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Stop chasing invoices.<br />Let AI do it for you.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Invoice Chase automatically syncs your QuickBooks AR data, drafts personalized follow-up emails in your tone, tracks opens, and helps you get paid — without the awkwardness.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ background: 'var(--accent)', color: 'white', padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>Start free trial — 14 days free</Link>
          <Link href="/demo" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>📅 Book a demo</Link>
        </div>

        {/* Demo Video Placeholder */}
        <div style={{ marginTop: '3rem', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', maxWidth: 800, margin: '3rem auto 0', position: 'relative', cursor: 'pointer' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(/dashboard-preview.png) center/cover', opacity: 0.3 }} />
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 0, height: 0, borderLeft: '20px solid var(--accent)', borderTop: '12px solid transparent', borderBottom: '12px solid transparent', marginLeft: 4 }} />
            </div>
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, zIndex: 1 }}>Watch 2-min product demo</div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '3rem 2rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { stat: '$2.4M', label: 'Invoices recovered' },
            { stat: '94%', label: 'Open rate on follow-ups' },
            { stat: '14 days', label: 'Avg. time to payment' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{item.stat}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>Why manual follow-up fails</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Invoice Chase vs. everything else</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Manual</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Other Tools</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--accent)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Invoice Chase</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Auto-sync from QuickBooks', manual: '❌', other: '❌', chase: '✅' },
                { feature: 'AI-generated follow-up emails', manual: '❌', other: '⚠️', chase: '✅' },
                { feature: 'Email open tracking', manual: '❌', other: '⚠️', chase: '✅' },
                { feature: 'Tone customization (3 modes)', manual: '❌', other: '⚠️', chase: '✅' },
                { feature: 'Multi-client dashboard', manual: '❌', other: '⚠️', chase: '✅' },
                { feature: 'Overdue aging report', manual: '⚠️', other: '⚠️', chase: '✅' },
                { feature: 'Client grouping by name', manual: '❌', other: '⚠️', chase: '✅' },
                { feature: 'Draft history per invoice', manual: '❌', other: '❌', chase: '✅' },
              ].map(row => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.85rem', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontSize: '1.1rem' }}>{row.manual}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontSize: '1.1rem' }}>{row.other}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontSize: '1.1rem', background: 'rgba(99,102,241,0.05)' }}>{row.chase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '4rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Trusted by bookkeepers everywhere</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                quote: "I used to spend 3 hours every week sending follow-up emails. Now Invoice Chase drafts them for me and I've recovered over $40K in the last quarter alone.",
                name: "Sarah K.", role: "Freelance bookkeeper, 12 years exp.",
                result: "$40K recovered"
              },
              {
                quote: "The AI tone settings are spot-on. My clients are small businesses — I use the firm tone for the bigger invoices and friendly for the smaller ones. Total game changer.",
                name: "Marcus T.", role: "CPA firm owner, 85 clients",
                result: "3hrs/week saved"
              },
              {
                quote: "I was skeptical about another tool, but the QuickBooks sync actually works. It pulls all my overdue AR automatically. My AR turnaround went from 45 to 22 days.",
                name: "Jennifer L.", role: "Controller, 3-person firm",
                result: "AR from 45→22 days"
              },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '1rem', color: 'var(--text)' }}>"{t.quote}"</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                  <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>{t.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: '4rem 2rem', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>🔒 How we protect your data</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Enterprise-grade security for financial data</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🛡️', title: 'SOC 2 Type II', desc: 'Annual third-party security audits' },
            { icon: '🇪🇺', title: 'GDPR Compliant', desc: 'Full data portability and deletion rights' },
            { icon: '🔐', title: '256-bit AES', desc: 'All data encrypted at rest and in transit' },
            { icon: '🔑', title: 'OAuth Only', desc: 'QuickBooks access via official Intuit OAuth — we never store your QB password' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)', color: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Get paid faster, starting today</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem' }}>14-day free trial. No credit card required. Cancel anytime.</p>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>$149<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.8 }}>/month</span></div>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem' }}>Unlimited invoices, emails, and clients</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: 'white', color: 'var(--accent)', padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 700 }}>Start free trial</Link>
            <Link href="/demo" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.85rem 2rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>Book a demo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact</span>
        </div>
        © 2026 Invoice Chase. All rights reserved.
      </footer>
    </div>
  )
}