import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CampusSpace | Sistem Manajemen Fasilitas Kampus",
  description: "Pesan ruangan dan lapor kerusakan fasilitas kampus dengan mudah dan real-time.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}
