import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Verto AI - Create Stunning Presentations with AI",
    template: "%s | Verto AI",
  },
  description: "Transform your ideas into professional presentations instantly with Verto AI. The most advanced AI-powered presentation generator for effortless, beautiful slides.",
  keywords: ["AI presentation generator", "pitch deck creator", "AI slides", "automated design", "powerpoint alternative", "presentation software", "Verto AI"],
  authors: [{ name: "Verto AI Team" }],
  creator: "Verto AI",
  publisher: "Verto AI",
  metadataBase: new URL("https://verto.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verto.ai",
    title: "Verto AI - Create Stunning Presentations with AI",
    description: "Transform your ideas into professional presentations instantly. Build decks, mobile prototypes, and more with generative AI.",
    siteName: "Verto AI",
    images: [
      {
        url: "/og-image.png", // Assuming an OG image exists or will exist
        width: 1200,
        height: 630,
        alt: "Verto AI Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verto AI - Create Stunning Presentations with AI",
    description: "Transform your ideas into professional presentations instantly with Verto AI.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={
        { baseTheme: dark }
      }>

      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "ykuxal2u42");
              `,
            }}
          />

          <ThemeProvider
            attribute={'class'}
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <Toaster />
          </ThemeProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}
