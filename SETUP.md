# Setup Guide — Harshit Bhuju Portfolio

## 1. Install

```bash
npm install
# or
yarn
```

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill every value in `.env.local` as described below.

---

### A. Supabase + Prisma

1. Go to [supabase.com](https://supabase.com) → New project.
2. **Settings → Database → Connection string → URI**  
   Copy the string. Replace `[YOUR-PASSWORD]` with your database password.
3. Paste into `DATABASE_URL` in `.env.local`.
4. Run:

```bash
npx prisma generate
npx prisma db push
```

This creates the `Project`, `Achievement`, and `SiteSettings` tables.

5. (Optional) Seed projects from `src/lib/data.ts` by writing a small script, or edit via `/admin` after login.

**Storage (images / certificates / videos):**

1. Supabase → **Storage** → New bucket → name it `portfolio`.
2. Set bucket to **Public** (or use signed URLs).
3. Upload files → copy the public URL (looks like  
   `https://[ref].supabase.co/storage/v1/object/public/portfolio/filename.jpg`).
4. Paste that URL into:
   - Project **thumbnail / gallery / video** in Admin → Manage Projects  
   - Or achievement `certificateUrl` in `src/lib/data.ts` / DB.

---

### B. NextAuth + GitHub OAuth

1. [GitHub → Settings → Developer settings → OAuth Apps → New](https://github.com/settings/developers)
2. Application name: `Harshit Portfolio Admin`
3. Homepage URL: `http://localhost:3000` (or your production domain)
4. Authorization callback URL:  
   `http://localhost:3000/api/auth/callback/github`
5. Copy **Client ID** and generate **Client Secret** → put in `.env.local`.
6. Set `GITHUB_USERNAME=Harshit-Bhuju` (only this account can access `/admin`).
7. Generate secret:

```bash
openssl rand -base64 32
```

Paste into `NEXTAUTH_SECRET`.

---

### C. Resend (contact form)

1. [resend.com](https://resend.com) → API Keys → Create.
2. Paste into `RESEND_API_KEY`.
3. For testing, emails can send from `onboarding@resend.dev`.  
   For production, add and verify your domain in Resend.

---

### D. Social links

Edit `src/lib/data.ts` → `profile`:

```ts
facebook: "https://facebook.com/yourprofile",  // or "" to hide
instagram: "https://instagram.com/yourprofile",
```

LinkedIn, GitHub, phone, WhatsApp, email are already set from your resume.

---

### E. Certificates

In `src/lib/data.ts`, for each achievement set:

```ts
certificateUrl: "https://....supabase.co/storage/v1/object/public/portfolio/cert-harvard.jpg",
```

Or leave `null` — the modal still opens with details and a placeholder.

---

## 3. Run

```bash
npm run dev
# open http://localhost:3000
# admin login (SECRET path — not linked publicly):
#   http://localhost:3000/admin/loginForHarshitBhuju
# (value comes from ADMIN_LOGIN_SECRET in .env)
# After login you land on /admin. Use Log out on the admin pages.
```

## 4. Production build

```bash
npm run build
# or
yarn build
```

Then:

```bash
npm start
```

Deploy to Vercel: connect the repo, add the same env vars, set production GitHub OAuth callback to  
`https://yourdomain.com/api/auth/callback/github`.

---

## What you can edit from the website

| Content              | Where                                      |
|----------------------|--------------------------------------------|
| Project text / media | `/admin` → Manage Projects                 |
| Visibility / order   | Same                                       |
| Certificates         | `certificateUrl` in data or future admin   |
| Socials              | `src/lib/data.ts` → `profile`              |
| Resume PDF           | Replace `/public/resume.pdf`               |
| Profile photo        | Replace `/public/profile.jpg`              |

Until `DATABASE_URL` is set, project edits in admin update the **session only**. Connect Prisma for permanent storage.


### Admin login (hidden)

Open only:

```
http://localhost:3000/admin/login?value=loginForHarshitBhuju
```

`/admin` without a session goes to the homepage (login URL is never shown automatically).

### Supabase Storage bucket

1. Storage → New bucket → name `portfolio`
2. Turn **Public bucket** ON
3. Paste service role key into `SUPABASE_SERVICE_ROLE_KEY` in `.env`
4. Upload images from Admin → Projects → Edit → Upload thumbnail / gallery
