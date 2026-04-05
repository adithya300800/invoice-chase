import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Invoice Chase — Stop chasing overdue invoices manually',
  description: 'Invoice Chase connects to your Gmail and QuickBooks, finds overdue invoices, and drafts personalized follow-up emails with AI. Send with one click.',
  keywords: 'invoice chase, accounts receivable, AR follow-up, overdue invoices, AI invoice reminders',
  openGraph: {
    title: 'Invoice Chase',
    description: 'AI-powered invoice follow-ups that get you paid faster',
    url: 'https://invoicechase.app',
    siteName: 'Invoice Chase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Chase',
    description: 'AI-powered invoice follow-ups that get you paid faster',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
