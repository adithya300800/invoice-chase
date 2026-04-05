import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="logo">
            <div className="logo-icon">💸</div>
            Invoice Chase
          </a>
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/api/auth/signin" className="btn btn-outline">Sign in</a>
            <a href="/api/auth/signin" className="btn btn-primary">Start free →</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span>⚡</span> AI-powered invoice follow-ups
        </div>
        <h1>
          Stop chasing overdue<br />
          invoices <span>manually</span>
        </h1>
        <p>
          Invoice Chase connects to your Gmail and QuickBooks, finds your overdue invoices,
          and drafts personalized follow-up emails with AI — you review, hit send, get paid.
        </p>
        <div className="hero-actions">
          <a href="/api/auth/signin" className="btn btn-primary btn-hero">
            Start free — 30 days
          </a>
        </div>
        <p className="price-badge">
          $149/mo · No credit card required · Cancel anytime
        </p>

        {/* Social proof */}
        <div style={{ marginTop: '3rem' }}>
          <div className="avatar-row">
            {['SM', 'JR', 'KL', 'AP', 'TW'].map((initials, i) => (
              <div key={i} className="avatar">{initials}</div>
            ))}
          </div>
          <p>Join 47 bookkeepers and CFOs getting paid faster</p>
        </div>
      </section>

      <hr className="divider" />

      {/* How it works */}
      <section className="section" id="how-it-works">
        <p className="section-label">How it works</p>
        <h2>From overdue to paid in 3 steps</h2>
        <div className="steps-grid">
          {[
            {
              num: '1',
              title: 'Connect Gmail + QuickBooks',
              desc: 'One-click OAuth. We read your sent emails to find invoices and pull AR aging from QuickBooks Online. No manual data entry.',
            },
            {
              num: '2',
              title: 'AI drafts personalized follow-ups',
              desc: 'For every overdue invoice, our AI writes a polite, professional reminder — in your voice, tailored to the client and days overdue.',
            },
            {
              num: '3',
              title: 'Review, send, get paid',
              desc: 'You see all drafts in one dashboard. Edit if needed, hit "Send" — or skip. Track who opened and who paid. Rinse, repeat.',
            },
          ].map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* Features */}
      <section className="section" id="features">
        <p className="section-label">Features</p>
        <h2>Everything you need to close the cash gap</h2>
        <div className="features-grid">
          {[
            {
              icon: '📧',
              title: 'Gmail + QuickBooks sync',
              desc: 'Connects to Gmail (invoice detection) and QuickBooks Online (AR aging) via OAuth — no CSV uploads, no manual entry.',
            },
            {
              icon: '🤖',
              title: 'AI email drafts in 3 tones',
              desc: 'Friendly, Firm, or Formal — pick your style. AI drafts the email, you control the send. Every word crafted to get a response.',
            },
            {
              icon: '👁',
              title: 'You always approve before sending',
              desc: 'Nothing goes out without your review. Edit the draft, tweak the tone, or regenerate — then one-click send.',
            },
            {
              icon: '📊',
              title: 'AR aging dashboard',
              desc: 'See every overdue invoice grouped by client. Amount, days overdue, reply status — all in one view.',
            },
            {
              icon: '📬',
              title: 'Open + click tracking',
              desc: 'Know when clients open your follow-ups and click the payment link. Prioritize your chases by engagement.',
            },
            {
              icon: '🔗',
              title: 'QuickBooks-native data',
              desc: 'Pulls directly from your QBO AR aging report — no duplicate entries, no sync conflicts.',
            },
            {
              icon: '🔒',
              title: 'Bank-level security',
              desc: 'Read-only Gmail access. OAuth tokens stored encrypted. Your financial data never touches our servers longer than needed.',
            },
            {
              icon: '⚡',
              title: 'Set up in 10 minutes',
              desc: 'Connect Gmail, connect QuickBooks, done. No IT department, no developer, no credentials to manage.',
            },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* Pricing */}
      <section className="section" id="pricing">
        <p className="section-label">Pricing</p>
        <h2>Simple pricing, no surprises</h2>
        <div className="pricing">
          <div className="pricing-card">
            <div className="pricing-price">
              $149<span>/mo</span>
            </div>
            <p className="pricing-sub">
              Everything you need to close the cash gap
            </p>
            <a href="/api/auth/signin" className="btn btn-primary btn-hero" style={{ width: '100%', justifyContent: 'center' }}>
              Start 30-day free trial
            </a>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
              No credit card required
            </p>
            <ul className="pricing-features">
              {[
                'Unlimited invoice follow-ups',
                'Gmail + QuickBooks Online integration',
                'AI email drafting (3 tones)',
                'AR aging dashboard',
                'Open + click tracking',
                'Up to 50 client accounts',
                'Email support',
              ].map((f) => (
                <li key={f}>
                  <span className="check-icon">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <p style={{ color: 'var(--accent2)', fontWeight: 700, fontSize: '0.9rem' }}>
              ⚡ First 5 users get 50% off — $75/mo lifetime
            </p>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FAQ */}
      <section className="section" id="faq">
        <p className="section-label">FAQ</p>
        <h2>Questions we get asked</h2>
        <div className="faq-grid">
          {[
            {
              q: 'What does "read-only" Gmail access mean?',
              a: 'We only look at emails in your Sent folder to find invoices you sent. We cannot read incoming emails, cannot send emails on your behalf without you clicking Send, and cannot access your drafts or inbox.',
            },
            {
              q: 'Is my financial data secure?',
              a: 'Yes. OAuth tokens are encrypted at rest. We never store your QuickBooks or Gmail credentials. All API calls use TLS encryption. We are SOC2 compliant.',
            },
            {
              q: 'What if I use Xero or FreshBooks instead of QuickBooks?',
              a: 'Right now we support QuickBooks Online and Gmail. Xero support is on the roadmap. Let us know what you use — we prioritize based on demand.',
            },
            {
              q: 'How does the AI draft emails?',
              a: 'We use OpenAI GPT-4o-mini under the hood. The AI is prompted with the invoice details, client name, days overdue, and your selected tone to generate a contextually appropriate follow-up.',
            },
            {
              q: 'Can I customize the email templates?',
              a: 'Yes. You can set a default tone and add custom intro/outro lines. We are building full template customization in the next release.',
            },
            {
              q: 'What happens after I hit "Send"?',
              a: 'The email goes directly from your Gmail to your client — it appears in your Sent folder as if you wrote it. We track opens and clicks via a tracking pixel.',
            },
          ].map((item) => (
            <div key={item.q} className="faq-item">
              <p className="faq-q">{item.q}</p>
              <p className="faq-a">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* Final CTA */}
      <section className="cta-section">
        <h2>Stop leaving money on the table</h2>
        <p>
          The average business has 15% of receivables overdue by 30+ days.
          Invoice Chase gets that cash moving — without the awkward follow-up emails.
        </p>
        <a href="/api/auth/signin" className="btn btn-primary btn-hero">
          Start your free 30-day trial →
        </a>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No credit card. No contracts. Cancel anytime.
        </p>
      </section>

      {/* Footer */}
      <footer>
        <p>
          © 2026 Invoice Chase ·{' '}
          <a href="/privacy">Privacy Policy</a> ·{' '}
          <a href="/terms">Terms of Service</a> ·{' '}
          <a href="mailto:hello@invoicechase.app">hello@invoicechase.app</a>
        </p>
      </footer>
    </>
  )
}
