import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Sans } from "next/font/google";
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
import { ReceptionAwakening } from "@/src/constitutional-reception";
import { resolveRequestLocale } from "@/src/creator-language/resolve-request-locale";
import { getLocaleDefinition } from "@/src/creator-language";
import { InstallInvitationProvider, InstallInvitation, ServiceWorkerRegistrar } from "@/src/install-experience";

const arabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const latinFont = IBM_Plex_Sans({
  variable: "--font-latin",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
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
      className={`${arabicFont.variable} ${latinFont.variable} h-full antialiased`}
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
        <ReceptionAwakening />
      </body>
    </html>
  );
}
