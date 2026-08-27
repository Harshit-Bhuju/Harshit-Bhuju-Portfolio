import { notFound } from "next/navigation";

/** Used by middleware rewrite when someone hits the old /admin/login path. */
export default function NotFoundAdmin() {
  notFound();
}
