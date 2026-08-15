import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "รายงานการฝึกประสบการณ์วิชาชีพครู",
  description: "รายงานผลการฝึกสอนตลอด 2 ภาคเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
