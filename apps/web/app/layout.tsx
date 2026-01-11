export const metadata = {
  title: 'TASK Control Panel',
  description: 'Advanced Trading Automation Dashboard',
}

import './globals.css'
import { AuthProvider } from './auth/context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#d97706" />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
