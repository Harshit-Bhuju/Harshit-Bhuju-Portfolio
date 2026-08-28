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

    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "Harshit Bhuju <onboarding@resend.dev>";

    // 1. Send notification email to Harshit's personal inbox
    await resend.emails.send({
      from: fromAddress,
      to: "harshitbhuju123@gmail.com",
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      text: `You have received a new message through your portfolio website (https://www.harshitbhuju.com.np):\n\nSender: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nTip: Simply reply to this email to respond directly to ${name}.`,
    });

    // 2. Send a courteous, professional auto-reply to the visitor
    try {
      await resend.emails.send({
        from: fromAddress,
        to: email,
        replyTo: "harshitbhuju123@gmail.com",
        subject: `Thank you for reaching out, ${name}!`,
        text: `Hi ${name},\n\nThank you for reaching out through my portfolio (https://www.harshitbhuju.com.np)!\n\nI have received your message and wanted to let you know that I truly appreciate your note. I will review it carefully and get back to you as soon as possible.\n\nFor your reference, here is a copy of what you wrote:\n--------------------------------------------------\n${message}\n--------------------------------------------------\n\nWarm regards,\n\nHarshit Bhuju\nFrontend & Full-Stack Developer\nBanepa, Nepal\nPortfolio: https://www.harshitbhuju.com.np\nGitHub: https://github.com/Harshit-Bhuju\nLinkedIn: https://www.linkedin.com/in/harshit-bhuju/`,
      });
    } catch (autoReplyErr) {
      // In development / unverified domain test mode on Resend, sending to arbitrary emails may be restricted
      console.warn("Sender auto-reply notice (safe to ignore if domain is pending verification):", autoReplyErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

