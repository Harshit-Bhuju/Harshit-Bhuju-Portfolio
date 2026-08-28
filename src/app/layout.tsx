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
    default: "Harshit Bhuju | Frontend & Full-Stack Developer from Nepal",
    template: "%s | Harshit Bhuju",
  },
  description:
    "Harshit Bhuju is a frontend and full-stack developer from Banepa, Nepal, specializing in React, Next.js, TypeScript, PostgreSQL, and Prisma. Studying AI at Kathmandu University and building modern, accessible web experiences.",
  keywords: [
    "Harshit Bhuju",
    "Harshit Bhuju developer",
    "Harshit Bhuju Nepal",
    "Harshit Bhuju Banepa",
    "Frontend Developer Nepal",
    "Web Developer Banepa",
    "Next.js Developer Nepal",
    "React Developer Nepal",
    "Full Stack Developer Nepal",
    "TypeScript",
    "Kathmandu University developer",
    "Nepal web developer",
    "Banepa developer",
    "Portfolio",
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
    title: "Harshit Bhuju | Frontend & Full-Stack Developer from Nepal",
    description:
      "Harshit Bhuju is a frontend and full-stack developer from Banepa, Nepal. Building modern web applications with React, Next.js, TypeScript, PostgreSQL, and Prisma.",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 1000,
        alt: "Harshit Bhuju — Frontend & Full-Stack Developer from Banepa, Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harshit Bhuju | Frontend & Full-Stack Developer from Nepal",
    description:
      "Developer from Banepa, Nepal. React, Next.js, TypeScript, PostgreSQL, Prisma.",
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

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Harshit Bhuju",
    givenName: "Harshit",
    familyName: "Bhuju",
    url: siteUrl,
    image: `${siteUrl}/profile.jpg`,
    jobTitle: "Frontend & Full-Stack Developer",
    description:
      "Harshit Bhuju is a frontend and full-stack developer from Banepa, Nepal, specializing in React, Next.js, TypeScript, PostgreSQL, and Prisma. He is studying Artificial Intelligence at Kathmandu University.",
    email: "harshitbhuju123@gmail.com",
    telephone: "+977-9869372811",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Banepa",
      addressRegion: "Kavrepalanchowk",
      addressCountry: "NP",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Kathmandu University",
      url: "https://ku.edu.np",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "Frontend Developer",
      occupationLocation: {
        "@type": "Country",
        name: "Nepal",
      },
      skills:
        "React, Next.js, TypeScript, JavaScript, PostgreSQL, Prisma, Tailwind CSS, Node.js, Python",
    },
    sameAs: [
      "https://github.com/Harshit-Bhuju",
      "https://www.linkedin.com/in/harshit-bhuju/",
      "https://www.instagram.com/bhujuharshit_5/",
      "https://www.facebook.com/harshit.bhuju.2025",
    ],
    knowsAbout: [
      "Frontend Development",
      "Full-Stack Web Development",
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "PostgreSQL",
      "Prisma",
      "Tailwind CSS",
      "Node.js",
      "UI/UX Design",
      "Artificial Intelligence",
      "Machine Learning",
      "Python",
      "Accessibility",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Harshit Bhuju — Portfolio",
    url: siteUrl,
    description:
      "Portfolio of Harshit Bhuju, a frontend and full-stack developer from Banepa, Nepal.",
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
    name: "Harshit Bhuju — Frontend & Full-Stack Developer from Nepal",
    url: siteUrl,
    description:
      "Official portfolio of Harshit Bhuju, a developer from Banepa, Nepal.",
    mainEntity: {
      "@type": "Person",
      name: "Harshit Bhuju",
      jobTitle: "Frontend & Full-Stack Developer",
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Banepa",
        addressCountry: "NP",
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
        {/* Preload the LCP hero image — browser starts fetching before JS runs */}
        <link
          rel="preload"
          as="image"
          href="/profile.jpg"
          // @ts-expect-error fetchpriority is valid but not yet in TS types
          fetchpriority="high"
        />
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
