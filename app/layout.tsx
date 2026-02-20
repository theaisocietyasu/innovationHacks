import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Innovation Hacks 2026",
  description: "Innovation Hacks 2026 - ASU's Premier Student-Led Hackathon by The AI Society, GDSC, and SoDA",
  icons: "/assets/images/logo-dark-compact.svg",
  openGraph: {
    title: "Innovation Hacks 2026",
    description: "Innovation Hacks 2026 - ASU's Premier Student-Led Hackathon by The AI Society, GDSC, and SoDA",
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

      </body>
    </html>

  );
}
