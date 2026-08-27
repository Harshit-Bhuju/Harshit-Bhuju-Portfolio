# Project media guide

## Screenshots & certificates (local)

Put files in `public/`:

```
public/
  projects/
    antarprerana/
      cover.jpg
      shot-1.jpg
      shot-2.jpg
    rapireport/
      cover.jpg
      shot-1.jpg
    cultureconnect/
      cover.jpg
  certificates/
    harvard.jpg
    nist.jpg
```

Then in `src/lib/data.ts`:

```ts
thumbnailUrl: "/projects/antarprerana/cover.jpg",
galleryUrls: [
  "/projects/antarprerana/shot-1.jpg",
  "/projects/antarprerana/shot-2.jpg",
],
certificateUrls: ["/certificates/nist.jpg"],
```

## Videos (Google Drive)

1. Upload video to Drive
2. Share → Anyone with the link
3. Copy link like:
   `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
4. In data.ts:

```ts
videoUrl: "https://drive.google.com/file/d/FILE_ID/view?usp=sharing",
```

The site auto-embeds Drive as `/preview`. YouTube/Vimeo also work.
