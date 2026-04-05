'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { buildFollowUpEmail } from '@/lib/email-templates'
import { Toast } from '@/components/ui/Toast'

interface ComposerPageProps {
  params: Promise<{ invoiceId: string }>
}

export default function ComposerPage({ params }: ComposerPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [drafts, setDrafts] = useState<any[]>([])
  const [tone, setTone] = useState<'friendly' | 'firm' | 'formal'>('friendly')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchInvoiceData() }, [resolvedParams.invoiceId])

  async function fetchInvoiceData() {
    try {
      const [invRes, draftsRes] = await Promise.all([
        fetch(`/api/invoices/${resolvedParams.invoiceId}`),
        fetch(`/api/drafts?invoiceId=${resolvedParams.invoiceId}`),
      ])
      if (invRes.ok) { const d = await invRes.json(); setInvoice(d); generateEmail(d, tone) }
      if (draftsRes.ok) { const dd = await draftsRes.json(); setDrafts(dd) }
    } catch (err) { setToast({ message: 'Failed to load invoice data', type: 'error' }) }
    finally { setLoading(false) }
  }

  function generateEmail(inv: any, selectedTone: string) {
    const today = new Date()
    const dueDate = new Date(inv.dueDate)
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const formattedDueDate = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const email = buildFollowUpEmail({
      clientName: inv.clientName, invoiceNumber: inv.invoiceNumber, amount: inv.amount,
      dueDate: formattedDueDate, daysOverdue, tone: selectedTone as 'friendly' | 'firm' | 'formal',
    })
    setSubject(email.subject); setBody(email.body)
  }

  function handleRegenerate() { if (invoice) generateEmail(invoice, tone); setToast({ message: 'Email regenerated', type: 'success' }) }
  function handleToneChange(newTone: 'friendly' | 'firm' | 'formal') { setTone(newTone); if (invoice) generateEmail(invoice, newTone) }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      const res = await fetch('/api/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice?.id, subject, body, tone, status: 'draft' }) })
      if (res.ok) { const d = await res.json(); setDraftId(d.id); setToast({ message: 'Draft saved!', type: 'success' }) }
      else setToast({ message: 'Failed to save draft', type: 'error' })
    } catch { setToast({ message: 'Failed to save draft', type: 'error' }) }
    finally { setSaving(false) }
  }

  async function handleSend() {
    setSaving(true)
    let dId = draftId
    if (!dId) {
      const saveRes = await fetch('/api/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice?.id, subject, body, tone, status: 'pending' }) })
      if (saveRes.ok) { const d = await saveRes.json(); dId = d.id }
    }
    setSaving(false)
    if (!dId) { setToast({ message: 'Could not create draft', type: 'error' }); return }
    setSending(true)
    try {
      const res = await fetch('/api/drafts/send', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: dId }) })
      if (res.ok) { const d = await res.json(); setToast({ message: `Email sent at ${new Date(d.sentAt).toLocaleTimeString()}!`, type: 'success' }); setTimeout(() => router.push('/dashboard'), 2000) }
      else { const err = await res.json(); setToast({ message: err.error ?? 'Failed to send', type: 'error' }) }
    } catch { setToast({ message: 'Failed to send email', type: 'error' }) }
    finally { setSending(false) }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
  if (!invoice) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--text-muted)' }}>Invoice not found</div></div>

  const today = new Date(); const dueDate = new Date(invoice.dueDate)
  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Compose Follow-Up</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a personalized follow-up email for this overdue invoice.</p>
      </div>
      <div className="billing-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Client', value: invoice.clientName },
            { label: 'Invoice', value: invoice.invoiceNumber },
            { label: 'Amount', value: `$${invoice.amount.toFixed(2)}` },
            { label: 'Due Date', value: dueDate.toLocaleDateString() },
            { label: 'Days Overdue', value: `${daysOverdue} days`, color: daysOverdue > 30 ? '#ef4444' : daysOverdue > 14 ? '#f59e0b' : '#22c55e' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontWeight: 600, color: item.color ?? 'var(--text)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="composer">
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Tone</label>
          <div className="tone-selector">
            {(['friendly', 'firm', 'formal'] as const).map(t => (
              <button key={t} onClick={() => handleToneChange(t)} className={`tone-btn ${tone === t ? 'active' : ''}`} type="button">{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Subject Line</label>
          <input className="subject-input" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Body</label>
          <textarea className="email-body" value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 280 }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={handleRegenerate} disabled={saving || sending} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Regenerate</button>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSaveDraft} disabled={saving || sending} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save Draft'}</button>
          <button onClick={handleSend} disabled={sending} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>{sending ? 'Sending...' : 'Approve & Send'}</button>
        </div>
      </div>
      {drafts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Previous Drafts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {drafts.map(d => (
              <div key={d.id} onClick={() => { setSubject(d.subject); setBody(d.body); setTone(d.tone as any); setDraftId(d.id) }}
                style={{ padding: '0.75rem 1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{d.subject}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{d.tone} · {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}