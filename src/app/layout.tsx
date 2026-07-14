import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'KaramcharHR Portal | Indian Employee-First HRMS Platform',
    template: '%s | KaramcharHR'
  },
  description: 'Access your KaramcharHR portal. Manage payroll, attendance tracking, leave requests, employee profiles, and statutory compliance from one intelligent dashboard.',
  keywords: [
    "KaramcharHR Login",
    "Employee Portal India",
    "HR Dashboard",
    "Payroll Management Login",
    "Self Service HR Portal",
    "KaramcharHR app"
  ],
  icons: { icon: '/icon.svg' },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://app.karamcharhr.online",
    title: "KaramcharHR Portal | Indian Employee-First HRMS",
    description: "Access payroll, attendance tracking, leave requests, and employee self-service.",
    siteName: "KaramcharHR Portal",
  },
  twitter: {
    card: "summary",
    title: "KaramcharHR Portal",
    description: "Indian Employee-First HRMS Portal",
  },
  alternates: {
    canonical: "https://app.karamcharhr.online",
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=general-sans@400,500,600,700&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "KaramcharHR Portal",
              "operatingSystem": "All",
              "applicationCategory": "BusinessApplication",
              "description": "Employee portal to manage payroll, attendance tracking, leave requests, and self-service dashboards.",
              "publisher": {
                "@type": "Organization",
                "name": "KaramcharHR"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}<SpeedInsights /><Analytics /></body>
    </html>
  )
}
