import type { Metadata, Viewport } from "next";
import { Baloo_2, Fredoka } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Baby Mo Quiz — Tebak Hewan Laut",
  description:
    "Baby Mo Quiz: pembuat video kuis seru untuk anak. Tebak hewan laut, rekam dengan OBS/QuickTime, dan buat video YouTube edukatif.",
  applicationName: "Baby Mo Quiz",
};

export const viewport: Viewport = {
  themeColor: "#06367a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
