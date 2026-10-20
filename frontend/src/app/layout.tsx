import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTMS — Universal Tournament Platform",
  description: "Discover sports, follow tournament schedules and results, and find your next competition.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

