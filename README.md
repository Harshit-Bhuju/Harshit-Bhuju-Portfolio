# Harshit Bhuju Portfolio — Production

## Setup

```bash
yarn install
# or: npm install

# Tables (once)
npx prisma db push
npx prisma generate

# Dev
yarn dev

# Production
yarn build
yarn start
```

## Environment (`.env`)

Required:
- `DATABASE_URL` / `DIRECT_URL` (Supabase Postgres)
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_USERNAME`
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET=portfolio`
- `NEXT_PUBLIC_SITE_URL` (production domain, no trailing slash)

Optional: `RESEND_API_KEY`, `ADMIN_LOGIN_SECRET`

## Admin

1. Login: `/admin/login?value=loginForHarshitBhuju` (or your secret)
2. **Manage projects** — text, gallery images, **upload video** (mp4/webm)
3. **Manage content** — profile, contact, education, skills, resume PDF, profile photo

## Media (Supabase bucket `portfolio`)

Allow MIME types: images, `video/mp4`, `video/webm`, `application/pdf`.

| Asset | Where |
|-------|--------|
| Project images | Admin → Projects → thumbnail / gallery |
| Project video | Admin → Projects → **Upload video** (saved as `videoUrl`) |
| Profile photo | Admin → Site content |
| Resume PDF | Admin → Site content |

Case study page: image carousel + native video player (or YouTube/Vimeo URL).

## SEO / a11y / performance

- Metadata + Open Graph + Twitter cards (home + project pages)
- JSON-LD Person schema
- `robots.ts` / `sitemap.ts`
- Skip link, `lang="en"`, reduced-motion respect (GSAP/Lenis)
- Image AVIF/WebP, long cache headers, `poweredByHeader: false`

## Notes

- No mock `data.ts` — content is database-only
- Seed button removed
