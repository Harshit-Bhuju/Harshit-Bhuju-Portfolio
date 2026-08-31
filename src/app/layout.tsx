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

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const siteUrl =
  rawUrl && !rawUrl.includes("localhost")
    ? rawUrl
    : "https://www.harshitbhuju.com.np";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#F7F7F7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const pageTitle = "Harshit Bhuju | Frontend Developer from Nepal";
const pageDescription = "Harshit Bhuju is a frontend developer from Banepa, Nepal, building modern React and Next.js applications while studying BTech AI at Kathmandu University.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: pageTitle,
    template: "%s | Harshit Bhuju",
  },
  description: pageDescription,
  keywords: [
    "Harshit Bhuju",
    "Frontend Developer Nepal",
    "React Developer Nepal",
    "Next.js Developer Nepal",
    "Web Developer Banepa",
    "Kathmandu University BTech AI",
    "TypeScript Developer Nepal",
    "Frontend Engineer Nepal",
    "Banepa developer portfolio",
    "Nepal web developer portfolio",
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
    siteName: "Harshit Bhuju — Frontend Developer & BTech AI Student",
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: `${siteUrl}/profile.jpg`,
        secureUrl: `${siteUrl}/profile.jpg`,
        width: 1200,
        height: 630,
        alt: "Harshit Bhuju — Frontend Developer from Banepa, Nepal",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [`${siteUrl}/profile.jpg`],
    creator: "@harshitbhuju",
    site: "@harshitbhuju",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
        process.env.BING_SITE_VERIFICATION ||
        "",
    },
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: siteUrl,
    dateCreated: "2024-01-01T00:00:00+05:45",
    datePublished: "2024-01-01T00:00:00+05:45",
    dateModified: new Date().toISOString(),
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Harshit Bhuju",
    givenName: "Harshit",
    familyName: "Bhuju",
    url: siteUrl,
    image: `${siteUrl}/profile.jpg`,
    jobTitle: "Frontend Developer",
    description: pageDescription,
    email: "harshitbhuju123@gmail.com",
    telephone: "+977-9869372811",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Banepa",
      addressRegion: "Kavrepalanchowk",
      addressCountry: "NP",
    },
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Kathmandu University",
      url: "https://ku.edu.np",
      description: "BTech in Artificial Intelligence — First Year, First Semester",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "Frontend Developer",
      occupationLocation: {
        "@type": "Country",
        name: "Nepal",
      },
      skills:
        "React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux Toolkit, RTK Query, Python, HTML, CSS",
    },
    sameAs: [
      "https://github.com/Harshit-Bhuju",
      "https://www.linkedin.com/in/harshit-bhuju/",
      "https://www.instagram.com/bhujuharshit_5/",
      "https://www.facebook.com/harshit.bhuju.2025",
    ],
    knowsAbout: [
      "Frontend Development",
      "Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Redux Toolkit",
      "RTK Query",
      "UI/UX Design",
      "Artificial Intelligence",
      "Python",
      "Accessibility",
      "Responsive Design",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Harshit Bhuju — Portfolio",
    url: siteUrl,
    description:
      "Portfolio of Harshit Bhuju, a frontend developer from Banepa, Nepal.",
    author: {
      "@type": "Person",
      name: "Harshit Bhuju",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/projects/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Harshit Bhuju — Frontend Developer from Nepal",
    url: siteUrl,
    description:
      "Official portfolio of Harshit Bhuju, a developer from Banepa, Nepal.",
    mainEntity: {
      "@type": "Person",
      name: "Harshit Bhuju",
      jobTitle: "Frontend Developer",
      url: siteUrl,
      sameAs: [
        "https://github.com/Harshit-Bhuju",
        "https://www.linkedin.com/in/harshit-bhuju/",
        "https://www.facebook.com/harshit.bhuju.2025",
        "https://www.instagram.com/bhujuharshit_5/",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Banepa",
        addressRegion: "Kavrepalanchowk",
        addressCountry: "NP",
      },
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Kathmandu University",
      },
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts CDN for font loading speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
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
