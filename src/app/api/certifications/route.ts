import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const data = await prisma.certification.findMany({
      where: all ? undefined : { visible: true },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": all ? "no-store" : "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("certifications GET", e);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");
    const created = await prisma.certification.create({ data: body });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("certifications POST", e);
    return NextResponse.json({ error: "Create failed", detail: String(e) }, { status: 500 });
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
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { id: _id, createdAt, updatedAt, ...rest } = body;
    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.certification.update({ where: { id }, data: rest });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("certifications PUT", e);
    return NextResponse.json({ error: "Update failed", detail: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.certification.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("certifications DELETE", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
