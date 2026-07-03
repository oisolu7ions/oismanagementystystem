import { redirect, RedirectType } from "next/navigation";

export default function ClientIndexPage() {
  redirect("/client/dashboard", RedirectType.replace);
}
