import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/context/ToastContext";
import Providers from "@/components/Providers";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-geist",
  display: "swap",
  preload: true,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://harshitbhuju.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#F7F7F7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Harshit Bhuju — Frontend Developer & Competitive Tech Builder",
    template: "%s | Harshit Bhuju",
  },
  description:
    "Harshit Bhuju is a Frontend Developer and Competitive Tech Builder based in Nepal. Specializing in Next.js, React, TypeScript, and accessible UI — building clean, scalable digital experiences.",
  keywords: [
    "Harshit Bhuju",
    "Frontend Developer",
    "Next.js Developer",
    "React Developer",
    "TypeScript",
    "UI UX",
    "Nepal",
    "Banepa",
    "Portfolio",
    "Web Developer",
  ],
  authors: [{ name: "Harshit Bhuju", url: siteUrl }],
  creator: "Harshit Bhuju",
  publisher: "Harshit Bhuju",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Harshit Bhuju",
    title: "Harshit Bhuju — Frontend Developer & Competitive Tech Builder",
    description:
      "Frontend Developer and Competitive Tech Builder based in Nepal. Building clean, scalable, accessible digital experiences with modern web technologies.",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 1000,
        alt: "Harshit Bhuju — Frontend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harshit Bhuju — Frontend Developer",
    description:
      "Frontend Developer and Competitive Tech Builder. Building thoughtful digital experiences.",
    images: ["/profile.jpg"],
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
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harshit Bhuju",
  url: siteUrl,
  image: `${siteUrl}/profile.jpg`,
  jobTitle: "Frontend Developer",
  description:
    "Frontend Developer and Competitive Tech Builder based in Nepal.",
  email: "mailto:harshitbhuju123@gmail.com",
  telephone: "+977-9869372811",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Banepa",
    addressRegion: "Kavrepalanchowk",
    addressCountry: "NP",
  },
  sameAs: [
    "https://github.com/Harshit-Bhuju",
    "https://www.linkedin.com/in/harshit-bhuju/",
    "https://www.instagram.com/bhujuharshit_5/",
    "https://www.facebook.com/harshit.bhuju.2025",
  ],
  knowsAbout: [
    "Frontend Development",
    "React",
    "Next.js",
    "TypeScript",
    "UI/UX",
    "Accessibility",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-bg text-primary min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-elevated focus:text-primary focus:px-4 focus:py-2 focus:border focus:border-strong-border focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        <Providers>
          <ThemeProvider>
            <ToastProvider>
              <SmoothScroll>{children}</SmoothScroll>
            </ToastProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
