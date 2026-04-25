import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "CampusSpace | Sistem Manajemen Fasilitas Kampus",
  description: "Solusi modern peminjaman ruangan dan fasilitas kampus secara transparan dan real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <Toaster richColors position="top-center" />
        {children}
      </body>
    </html>
  );
}
