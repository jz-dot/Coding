import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greystone Trading Platform",
  description: "Institutional-grade trading terminal with AI-powered analysis, autonomous agents, and real-time market data.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0e17] text-[#e8edf5]" style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}>
        {children}
      </body>
    </html>
  );
}
