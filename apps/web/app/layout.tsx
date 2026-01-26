export const metadata = {
  title: "TASK Control Panel",
  description: "Advanced Trading Automation Dashboard",
  icons: {
    icon: "/wall-e-icon.png",
    shortcut: "/wall-e-icon.png",
    apple: "/wall-e-icon.png",
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
      <body className="min-h-screen antialiased bg-gray-900 text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
