import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/src/design-system/azma-identity.css";
import "@/src/design-system/azma-behaviors.css";
import "@/src/design-system/azma-elements.css";
import "@/src/design-system/azma-direction.css";
import "@/src/design-system/azma-interaction.css";
import { DirectorStage } from "@/src/sovereign-identity";
import { HeartPulse } from "@/src/sovereign-heart";
import { CoreThought } from "@/src/sovereign-core";
import { ConsciousnessAwakening } from "@/src/sovereign-consciousness";
import { MemoryAwakening } from "@/src/sovereign-memory";
import { EvolutionAwakening } from "@/src/sovereign-evolution";
import { OperationsAwakening } from "@/src/constitutional-operations";
import { resolveRequestLocale } from "@/src/creator-language/resolve-request-locale";
import { getLocaleDefinition } from "@/src/creator-language";
import { InstallInvitationProvider, InstallInvitation, ServiceWorkerRegistrar } from "@/src/install-experience";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AZMA OS",
  description: "The Living Empire — sovereign generation with Qiyamah.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AZMA OS",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

/**
 * IMPERIAL FIRST CREATOR IMPLEMENTATION — Language Experience & Install
 * Experience are now platform-wide, mounted here rather than per-page:
 * every page and chamber beneath this layout resolves the same Creator
 * locale (Gate, Identity/Entry, and Chambers alike — Chambers are wired
 * into the mechanism now, translated later, per Council direction), and
 * the Install Invitation / service worker registration are available on
 * every route, never a page-specific implementation.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveRequestLocale();
  const direction = getLocaleDefinition(locale).direction;

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InstallInvitationProvider>
          {children}
          <InstallInvitation />
        </InstallInvitationProvider>
        <ServiceWorkerRegistrar />
        <DirectorStage />
        <HeartPulse />
        <CoreThought />
        <ConsciousnessAwakening />
        <MemoryAwakening />
        <EvolutionAwakening />
        <OperationsAwakening />
      </body>
    </html>
  );
}
