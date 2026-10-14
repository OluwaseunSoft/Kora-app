import type { Metadata, Viewport } from "next";
import { KoraProvider } from "../components/provider";
import "./globals.css";
export const metadata: Metadata = {
  title: "Kora · Future Self Lab",
  description:
    "An offline-first learning companion. A little today. A different tomorrow.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Kora", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#174b3b",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <KoraProvider>{children}</KoraProvider>
      </body>
    </html>
  );
}
