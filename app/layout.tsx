import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MasterChess AI — Train sharper. Play smarter.",
  description: "A modern, free chess training and analysis workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
