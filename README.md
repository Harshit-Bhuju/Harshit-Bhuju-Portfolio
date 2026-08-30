# Harshit Bhuju Portfolio

A modern, high-performance developer portfolio and project showcase built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Supabase**.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions & Dynamic Metadata)
- **Library**: React 19 & TypeScript
- **Styling**: Vanilla CSS tokens & Tailwind CSS
- **Database & ORM**: PostgreSQL via Supabase & [Prisma ORM](https://www.prisma.io/)
- **Storage**: Supabase Storage (direct client-side uploads bypassing serverless payload limits)
- **Authentication**: NextAuth.js
- **Animations**: GSAP, ScrollTrigger & Lenis smooth scrolling (disabled automatically on mobile and prefers-reduced-motion)

---

## 🚀 Getting Started

### 1. Installation

```bash
yarn install
# or
npm install
```

### 2. Database Sync

```bash
# Push Prisma schema to Supabase Postgres database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 3. Run Development Server

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:6543/postgres?pgboiler=true"
DIRECT_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Supabase Storage & API
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
NEXT_PUBLIC_SUPABASE_BUCKET="portfolio"

# Site URL (Production Domain, no trailing slash)
NEXT_PUBLIC_SITE_URL="https://www.harshitbhuju.com.np"

# Admin Authentication (Optional secret bypass)
ADMIN_LOGIN_SECRET="loginForHarshitBhuju"
```

---

## 🎛️ Admin Dashboard

Access the admin dashboard at `/admin/login` to manage all site content and projects dynamically:

1. **Projects Management (`/admin/projects`)**:
   - Create, edit, hide, or delete portfolio projects.
   - **Separate Descriptions**:
     - **Short Description**: Displayed on homepage project cards.
     - **Long Description**: Displayed inside the individual `/projects/[slug]` case study page.
   - **Engineering Deep-Dive**: Technical challenges and solutions narrative.
   - **Media Uploads**: Direct upload for thumbnails, multi-photo gallery carousels, and walkthrough videos (`mp4`, `webm`, `mov`).

2. **Content & Profile Management (`/admin/content`)**:
   - Personal profile identity, tagline, and bio.
   - Work experience, education, skills, certifications, and achievements.
   - Direct PDF upload for resume document.

---

## 🔍 SEO & Open Graph Setup

This repository follows full SEO best practices for high search visibility and social sharing:

- **Root Open Graph & Metadata (`src/app/layout.tsx`)**:
  - Global `title`, `description`, `canonical`, and branded `keywords` targeting developer search queries (Nepal, Banepa, Web Developer).
  - Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) & Twitter Cards (`summary_large_image`).
  - Structured JSON-LD `Person` schema.
- **Dynamic Project Open Graph (`src/app/projects/[slug]/page.tsx`)**:
  - Generates custom Open Graph metadata per project (title, thumbnail, description).
  - Embeds `SoftwareApplication` JSON-LD structured data for rich search engine indexing.
- **Sitemap & Robots**:
  - Dynamic `sitemap.xml` (`src/app/sitemap.ts`) listing main and project pages.
  - `robots.txt` (`src/app/robots.ts`) allowing crawling while protecting `/admin` and `/api/` endpoints.
  - Search engine indexing disabled on `/admin` routes (`src/app/admin/layout.tsx`).

---

## 🛠️ Production Build

```bash
yarn build
yarn start
```
