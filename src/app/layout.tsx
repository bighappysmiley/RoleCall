import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/actions/auth";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RoleCall — Hire talent. Find work.",
    template: "%s · RoleCall",
  },
  description:
    "Browse open roles and hire great people on RoleCall — the hiring marketplace for teams and talent.",
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
        className={`${instrument.variable} ${jakarta.variable} ${jetbrains.variable} flex min-h-screen flex-col antialiased`}
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
