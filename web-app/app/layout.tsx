import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日本雪場刮刮樂 | Japan Ski Resort Scratch Map",
  description: "記錄你的滑雪足跡，收集所有日本雪場！",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
