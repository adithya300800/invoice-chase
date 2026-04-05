interface EmailTone {
  friendly: { subject: string; body: string }
  firm: { subject: string; body: string }
  formal: { subject: string; body: string }
}

export function buildFollowUpEmail(data: {
  clientName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  daysOverdue: number
  tone: keyof EmailTone
  customIntro?: string
  customOutro?: string
}): { subject: string; body: string } {
  const { clientName, invoiceNumber, amount, dueDate, daysOverdue, tone, customIntro, customOutro } = data

  const tones: EmailTone = {
    friendly: {
      subject: `Invoice ${invoiceNumber} — A friendly reminder`,
      body: `Hi ${clientName},

${customIntro ?? `I wanted to give you a gentle nudge about invoice ${invoiceNumber} for $${amount.toFixed(2)}.`}

${daysOverdue > 30
  ? `It's been a little over a month now, and I just wanted to make sure this didn't slip through the cracks.`
  : `Just a quick check-in — this one slipped past its due date of ${dueDate}.`}

${customOutro ?? `If you've already sent payment or if there's anything I can help with on your end, just hit reply and let me know. Always happy to help!`}

Best,
Invoice Chase`,
    },
    firm: {
      subject: `Invoice ${invoiceNumber} — Payment overdue by ${daysOverdue} days`,
      body: `Dear ${clientName},

This is a formal reminder that invoice ${invoiceNumber} for $${amount.toFixed(2)} was due on ${dueDate} and is now ${daysOverdue} days overdue.

Amount outstanding: $${amount.toFixed(2)}
Invoice number: ${invoiceNumber}
Due date: ${dueDate}
Days overdue: ${daysOverdue}

${customIntro ?? `We have not received payment or communication regarding this outstanding balance.`}

Please arrange payment at your earliest convenience, or contact us to discuss a payment plan. If payment has already been sent, please disregard this notice and accept our thanks.

${customOutro ?? `For your convenience, you can reply to this email with any questions or concerns.`}`,
    },
    formal: {
      subject: `Re: Invoice ${invoiceNumber} — Follow-up`,
      body: `Dear ${clientName},

I hope this message finds you well. I am writing to follow up regarding Invoice ${invoiceNumber} in the amount of $${amount.toFixed(2)}, which was due for payment on ${dueDate}.

${customIntro ?? `According to our records, this invoice remains outstanding.`}

We kindly request that you review your account and arrange payment at your earliest convenience. If there are any circumstances that have prevented payment, please do not hesitate to contact us so we may resolve the matter promptly.

${customOutro ?? `Thank you for your attention to this matter. We look forward to hearing from you.`}`,
    },
  }

  return tones[tone]
}
