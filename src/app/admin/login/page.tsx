import { notFound } from "next/navigation";
import AdminLoginClient from "./LoginClient";

type Props = {
  searchParams: Promise<{ value?: string; error?: string; callbackUrl?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const secret = process.env.ADMIN_LOGIN_SECRET || "loginForHarshitBhuju";
  const value = params.value || "";

  if (!value || value !== secret) {
    notFound();
  }

  return (
    <AdminLoginClient
      error={params.error}
      callbackUrl={params.callbackUrl || "/admin"}
    />
  );
}
