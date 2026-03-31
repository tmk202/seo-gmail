import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antigravity Store | Gmail Tài Khoản Demo",
  description: "Cung cấp Gmail tài khoản Demo Antigravity uy tín.",
  keywords: "mua gmail, gmail demo, antigravity",
  openGraph: {
    title: "Mua Bán Tài Khoản Demo Antigravity",
    description: "Cung cấp Gmail Demo Antigravity.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
