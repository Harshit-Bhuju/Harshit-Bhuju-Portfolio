import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (
      !name ||
      typeof name !== "string" ||
      name.length > 100 ||
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !message ||
      typeof message !== "string" ||
      message.length > 5000
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!resend) {
      console.log("Contact form (no Resend key):", { name, email, message });
      return NextResponse.json({ ok: true });
    }

    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "harshitbhuju123@gmail.com",
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
