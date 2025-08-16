import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "iValidate - AI-Powered Startup Idea Validation",
  description: "Get AI-powered insights and data-backed validation for your startup idea in minutes. Skip weeks of manual research with our comprehensive analysis engine.",
  keywords: "startup validation, idea validation, market research, AI analysis, entrepreneur tools",
  authors: [{ name: "iValidate Team" }],
  openGraph: {
    title: "iValidate - AI-Powered Startup Idea Validation",
    description: "Get AI-powered insights and data-backed validation for your startup idea in minutes.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "iValidate - AI-Powered Startup Idea Validation",
    description: "Get AI-powered insights and data-backed validation for your startup idea in minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
