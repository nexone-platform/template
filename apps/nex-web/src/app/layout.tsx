import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
    title: "TechBiz - Build Your Dream Landing Page",
    description: "Create stunning, high-converting landing pages with our enterprise-grade platform. No coding required. Ultimate flexibility meets premium design.",
    keywords: ["landing page", "website builder", "no-code", "drag and drop", "premium design"],
    authors: [{ name: "TechBiz" }],
    openGraph: {
        title: "TechBiz - Build Your Dream Landing Page",
        description: "Create stunning, high-converting landing pages with our enterprise-grade platform.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
                />
            </head>
            <body suppressHydrationWarning>
                <ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider>
            </body>
        </html>
    );
}
