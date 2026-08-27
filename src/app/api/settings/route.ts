import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!row) {
      return NextResponse.json({ id: 1 });
    }
    return NextResponse.json(row, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("settings GET", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { id: _id, updatedAt, ...data } = body;
    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("settings PUT", e);
    return NextResponse.json({ error: "Update failed", detail: String(e) }, { status: 500 });
  }
}
