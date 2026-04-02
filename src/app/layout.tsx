import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
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
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#050510] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
