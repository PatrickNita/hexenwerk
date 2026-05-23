import type { Metadata, Viewport } from "next";
import { GeistPixelGrid } from "geist/font/pixel";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import CursorShell from "@/components/cursor-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEXENWERK — Tobacco",
  description: "HEXENWERK TOBACCO. 100% cigar leaf. Five distinct lines. One standard.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelGrid.variable} h-full`}
    >
      <body className="min-h-full">
        <CursorShell>{children}</CursorShell>
      </body>
    </html>
  );
}
