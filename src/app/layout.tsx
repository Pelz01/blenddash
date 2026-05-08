import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlendDash — Fluent Community Tools",
  description: "Revenue dashboards, RFA board, reputation map, and leaderboards for the Fluent ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          BlendDash · Built for the Fluent ecosystem ·{" "}
          <a href="https://github.com/Pelz01/blenddash" className="text-primary/70 hover:text-primary transition-colors">
            GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}
