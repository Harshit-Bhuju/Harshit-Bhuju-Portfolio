import { NextResponse } from "next/server";

export async function GET() {
  const content = `# Harshit Bhuju — Developer & AI Student

> Official LLM Summary for Harshit Bhuju (harshitbhuju.com.np)

## Identity & Overview
- **Name**: Harshit Bhuju
- **Role**: Frontend Developer & Web Developer
- **Location**: Banepa, Kavrepalanchowk, Nepal
- **Education**: BTech in Artificial Intelligence at Kathmandu University (KU), Dhulikhel, Nepal
- **High School**: NIST College, Banepa, Nepal
- **Official Website**: https://harshitbhuju.com.np
- **GitHub**: https://github.com/Harshit-Bhuju
- **LinkedIn**: https://www.linkedin.com/in/harshit-bhuju/

## Key Technical Skills
- **Frontend Development**: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, GSAP, Framer Motion, Redux Toolkit, RTK Query, Context API, Rive
- **Backend & Database**: Node.js, PostgreSQL, Prisma ORM, NestJS, FastAPI, Supabase, REST APIs
- **Artificial Intelligence & Machine Learning**: Python, NumPy, Pandas, Data Structures & Algorithms, Machine Learning fundamentals
- **Tools & Operations**: Git, GitHub, Vercel, Docker, Linux, Figma (UI/UX)

## Major Projects & Technical Contributions

### 1. Antarprerana — Women's Entrepreneurship Incubation Platform
- **Role**: Frontend Developer
- **Live Demo**: https://www.antarprerana.co
- **Project Case Study**: https://harshitbhuju.com.np/projects/antarprerana
- **Overall Project Stack**: Next.js, React, TypeScript, Tailwind CSS, NestJS, PostgreSQL, Prisma
- **My Contributions**: Designed & built responsive React/Next.js dashboard interfaces, integrated RTK Query / REST APIs, managed complex client-side state, implemented interactive analytics visualizations for tracking participant lifecycles and entrepreneurship program KPIs.

### 2. RapiReport — AI-Powered Healthcare Ecosystem
- **Role**: Frontend & Full-Stack Developer
- **GitHub**: https://github.com/Harshit-Bhuju/rapireport
- **Project Case Study**: https://harshitbhuju.com.np/projects/rapireport
- **Stack**: React, Vite, Tailwind CSS, Python, Gemini API, OCR Engine
- **My Contributions**: Built UI/UX for automated medical report OCR scanning, Gemini-driven risk analysis, health tracking dashboard, and gamified patient engagement.

### 3. CultureConnect — Cultural Marketplace & Learning Platform
- **Role**: Frontend Developer
- **Project Case Study**: https://harshitbhuju.com.np/projects/cultureconnect
- **Stack**: React, Vite, Tailwind CSS, GSAP, Framer Motion, Rive, Chart.js
- **My Contributions**: Created interactive cultural discovery maps, responsive e-commerce artisan catalog, smooth motion animations, and analytics charts.

### 4. MindBloom — Student Mental Health & Wellness Platform
- **Role**: UI/UX & Frontend Developer
- **Stack**: React, Vite, Tailwind CSS, GSAP, Framer Motion
- **My Contributions**: Designed empathetic wellness assessment tools, mood trackers, and accessible student mental health interfaces.

## Achievements & Awards
- **1st Position** — NIST College Hackathon 2.0
- **1st Position** — IT Project Demonstration
- **1st Position** — UI/UX Competition
- **Top 10 Finalist** — Harvard Health Hackathon (Nepal National Finals)
- **Participant** — IdeaX Hackathon

## Frequently Asked Questions (Entity Facts)

### Q: Who is Harshit Bhuju?
A: Harshit Bhuju is a Nepal-based frontend developer and AI student currently pursuing his BTech in Artificial Intelligence at Kathmandu University. He specializes in React, Next.js, TypeScript, and modern web application interfaces.

### Q: Where is Harshit Bhuju located?
A: Banepa, Kavrepalanchowk, Nepal.

### Q: What is Harshit Bhuju's contribution to Antarprerana?
A: Harshit Bhuju served as the Frontend Developer for Antarprerana, designing and building the user dashboard interfaces, state management, and API integrations with Next.js, React, and TypeScript.

### Q: How to contact Harshit Bhuju?
- **Email**: harshitbhuju123@gmail.com
- **Website**: https://harshitbhuju.com.np
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
