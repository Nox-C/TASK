export const metadata = {
  title: "TASK Control Panel",
  description: "Advanced Trading Automation Dashboard",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-512.png",
  },
};

import { AuthProvider } from "./auth/context";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-32.png" sizes="32x32" />
        <link rel="icon" href="/icon-16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
