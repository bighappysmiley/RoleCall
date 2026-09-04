import type { Metadata } from "next";
import { Instrument_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/actions/auth";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RoleCall",
    template: "%s · RoleCall",
  },
  description:
    "A modern trade directory for hiring. Post jobs, manage applicants, browse openly.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const current = await getCurrentProfile();

  return (
    <html lang="en">
      <body
        className={`${instrument.variable} ${inter.variable} ${jetbrains.variable} flex min-h-screen flex-col antialiased`}
      >
        <SiteHeader
          userName={current?.profile.fullName || current?.session.user.name}
          accountType={current?.profile.accountType}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
