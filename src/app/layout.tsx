import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make My Marriage — Your wedding. Beautifully organized.",
  description:
    "One shared space for your Indian wedding. Bring family, events, tasks, guests, expenses, and memories together with Make My Marriage.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
