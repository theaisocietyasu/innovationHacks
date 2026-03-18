import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Innovation Hacks 2026",
  description: "Innovation Hacks 2026 - ASU's Premier Student-Led Hackathon by The AI Society, GDG ASU, and SoDA",
  icons: {
    icon: "/assets/images/innovationhacklogo2026.png",
    apple: "/assets/images/innovationhacklogo2026.png",
  },
  openGraph: {
    title: "Innovation Hacks 2026",
    description: "Innovation Hacks 2026 - ASU's Premier Student-Led Hackathon by The AI Society, GDG ASU, and SoDA",
    images: ["/assets/images/innovationhacks2.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">
      <body className={inter.className}>{children}
        <Analytics />
        <SpeedInsights />
        <a
          id="mlh-trust-badge"
          style={{ display: "block", maxWidth: "100px", minWidth: "60px", position: "fixed", right: "60px", top: 0, width: "10%", zIndex: 10000 }}
          href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=white"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-white.svg" alt="Major League Hacking 2026 Hackathon Season" style={{ width: "100%" }} />
        </a>
      </body>
    </html>

  );
}
