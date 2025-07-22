import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "PNG to WebP Converter | แปลงไฟล์ PNG เป็น WebP",
  description: "แปลงไฟล์ PNG เป็น WebP ได้อย่างง่ายดาย ปลอดภัย 100% ทำงานใน Browser ไม่ต้องอัปโหลดไฟล์ รองรับหลายไฟล์พร้อมกัน",
  keywords: ["PNG to WebP", "แปลงรูป", "image converter", "webp converter", "thai"],
  authors: [{ name: "PNG to WebP Converter" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
