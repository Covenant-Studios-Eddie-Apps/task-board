import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Covenant Studios — Task Board",
  description: "Task management for Covenant Studios",
};

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
