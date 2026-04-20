import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
  weight: "200 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Preiseberechnen",
  description: "Preiseberechnen – Rechner, Blog und Kontakt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${clashDisplay.variable} min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        <div
          id="preiseberechnen-page-shell"
          className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col"
        >
          <div
            id="preiseberechnen-header-flow-spacer"
            className="h-[4.75rem] w-full shrink-0 md:h-[var(--preiseberechnen-header-desktop-offset)]"
            aria-hidden="true"
          />
          <div
            id="preiseberechnen-page-content"
            className="min-h-0 w-full min-w-0 flex-1"
          >
            {children}
          </div>
          <Header />
        </div>
        <Footer />
      </body>
    </html>
  );
}

