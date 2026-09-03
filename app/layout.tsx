import type { Metadata } from "next";
import { Instrument_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SetupBanner } from "@/components/setup-banner";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RoleCall — hiring, plainly",
    template: "%s · RoleCall",
  },
  description:
    "RoleCall is a two-sided hiring board by BigHappySmiley. Employers post jobs. Candidates apply. Placement is labeled.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrument.variable} ${inter.variable} ${jetbrains.variable} flex min-h-screen flex-col bg-paper text-ink`}
      >
        <SetupBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
