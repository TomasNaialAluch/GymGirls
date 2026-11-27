import type { Metadata } from "next";
import { Archivo, Fredoka, Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth/useAuth";
import { NoticeProvider } from "@/components/ui/Notice";
import SignalLayer from "@/components/ui/SignalLayer";
import PageTransition from "@/components/ui/PageTransition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Tipografía display de marca (logo, hero, títulos grandes) — BRAND.md §3.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

// Titulares condensados del estilo Póster (eje de ancho variable).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "GymGirls",
  description: "Rutinas y seguimiento de entrenamiento",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NoticeProvider>
            <AppShell>
              <PageTransition>{children}</PageTransition>
            </AppShell>
            <SignalLayer />
          </NoticeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
