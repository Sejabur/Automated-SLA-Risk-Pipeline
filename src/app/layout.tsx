import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automated SLA Risk Pipeline",
  description: "Enterprise TPRM Dashboard for CISOs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${inter.variable} h-full antialiased selection:bg-[#E76257] selection:text-white`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
