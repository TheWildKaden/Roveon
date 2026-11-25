import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roveon — AI development environment",
  description: "A focused workspace for building software with AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
