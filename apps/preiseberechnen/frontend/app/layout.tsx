import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "./components/Header";

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
    <html lang="de">
      <body className={clashDisplay.variable}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

