-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "number" TEXT,
    "category" TEXT,
    "date_range" TEXT,
    "short_description" TEXT,
    "long_description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "github_url" TEXT,
    "live_url" TEXT,
    "video_url" TEXT,
    "thumbnail_url" TEXT,
    "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificate_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "github_repo_name" TEXT,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "placement" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "year" TEXT,
    "description" TEXT,
    "story" TEXT,
    "certificate_url" TEXT,
    "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "date_range" TEXT,
    "points" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" SERIAL NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "school" TEXT,
    "date_range" TEXT,
    "gpa" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "date" TEXT,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_challenges" (
    "id" SERIAL NOT NULL,
    "project_slug" TEXT NOT NULL,
    "project_title" TEXT,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineering_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_notes" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "summary" TEXT,
    "body" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tech_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "organization" TEXT,
    "image_url" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" TEXT,
    "secondary_role" TEXT,
    "tagline" TEXT,
    "about_statement" TEXT,
    "about_body" TEXT,
    "about_focus" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "resume_path" TEXT,
    "profile_image" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tech_notes_slug_key" ON "tech_notes"("slug");

-- AddForeignKey
ALTER TABLE "engineering_challenges" ADD CONSTRAINT "engineering_challenges_project_slug_fkey" FOREIGN KEY ("project_slug") REFERENCES "projects"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
