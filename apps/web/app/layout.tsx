import './globals.css';

export const metadata = {
  title: 'WALL-E Trading Bot',
  description: 'WALL-E themed trading bot control panel',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#FFB800" />
        <meta name="background-color" content="#0D1B2A" />
      </head>
      <body>{children}</body>
    </html>
  );
}
