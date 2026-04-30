import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { VersionWatermark } from "@/components/shared/VersionWatermark";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEXT-FORCE",
  description: "NEXT-FORCE — Human Resource Management System",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
        <VersionWatermark />
      </body>
    </html>
  );
}
