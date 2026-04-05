'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import styles from './composer.module.css'

export default function ComposerPage() {
  const router = useRouter()
  const params = useSearchParams()
  const invoiceId = params.get('invoice')

  const [draft, setDraft] = useState<{ id: string; subject: string; emailBody: string; tone: string } | null>(null)
  const [invoice, setInvoice] = useState<{ clientName: string; amount: number; dueDate: string; invoiceNumber: string } | null>(null)
  const [tone, setTone] = useState('friendly')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [history, setHistory] = useState<Array<{ id: string; tone: string; createdAt: string }>>([])

  useEffect(() => {
    if (!invoiceId) return
    // Load invoice
    fetch(`/api/invoices`).then(r => r.json()).then(d => {
      const inv = (d.invoices ?? []).find((i: { id: string }) => i.id === invoiceId)
      if (inv) {
        setInvoice(inv)
        setSubject(`Invoice ${inv.invoiceNumber} — Follow-up`)
      }
    })
    // Load previous drafts
    fetch(`/api/drafts?invoiceId=${invoiceId}`).then(r => r.json()).then(d => {
      setHistory(d.drafts ?? [])
    })
    // Generate initial draft
    generateDraft()
  }, [invoiceId])

  async function generateDraft() {
    setRegenerating(true)
    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, tone }),
    })
    const data = await res.json()
    if (data.draft) {
      setDraft(data.draft)
      setSubject(data.draft.subject)
      setBody(data.draft.emailBody)
      setTone(data.draft.tone)
    }
    setRegenerating(false)
  }

  async function handleSend() {
    setSending(true)
    const res = await fetch('/api/drafts/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: draft?.id, subject, body }),
    })
    const data = await res.json()
    setSending(false)
    if (data.success) {
      router.push('/dashboard?sent=true')
    } else {
      alert('Failed to send: ' + (data.error ?? 'Unknown error'))
    }
  }

  if (!invoiceId) return <div className={styles.center}><p>No invoice selected.</p></div>

  const daysOverdue = invoice ? Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000) : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
        <h1>Follow-Up Composer</h1>
      </div>

      {invoice && (
        <div className={styles.invoiceCard}>
          <div className={styles.invoiceDetails}>
            <span className={styles.client}>{invoice.clientName}</span>
            <span>Invoice #{invoice.invoiceNumber}</span>
            <span>${invoice.amount.toFixed(2)}</span>
            <span className={daysOverdue > 30 ? styles.danger : styles.warn}>{daysOverdue} days overdue</span>
          </div>
        </div>
      )}

      {/* Tone selector */}
      <div className={styles.section}>
        <label className={styles.label}>Email tone</label>
        <div className={styles.toneSelector}>
          {['friendly', 'firm', 'formal'].map(t => (
            <button key={t} onClick={() => { setTone(t); setTimeout(generateDraft, 50) }}
              className={styles.toneBtn + (tone === t ? ' ' + styles.active : '')}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className={styles.section}>
        <label className={styles.label}>Subject line</label>
        <input className={styles.subjectInput} value={subject} onChange={e => setSubject(e.target.value)} />
      </div>

      {/* Body */}
      <div className={styles.section}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Email body</label>
          <button onClick={generateDraft} disabled={regenerating} className={styles.regenBtn}>
            {regenerating ? '✍️ Regenerating...' : '🔄 Regenerate'}
          </button>
        </div>
        <textarea className={styles.emailBody} value={body} onChange={e => setBody(e.target.value)} rows={12} />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={() => router.back()} className={styles.cancelBtn}>Cancel</button>
        <button onClick={handleSend} disabled={sending} className={styles.sendBtn}>
          {sending ? 'Sending...' : '✅ Approve & Send'}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className={styles.section}>
          <label className={styles.label}>Previous drafts</label>
          <div className={styles.historyList}>
            {history.map(h => (
              <div key={h.id} className={styles.historyItem}>
                <span>{h.tone}</span>
                <span>{new Date(h.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
