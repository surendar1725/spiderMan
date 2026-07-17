import type { Metadata, Viewport } from "next";
import { Bangers, Inter } from "next/font/google";
import "./globals.css";

const comicFont = Bangers({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "One Small Question...",
  description: "A heartfelt, awkward, funny invitation to watch Spider-Man together.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${comicFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
