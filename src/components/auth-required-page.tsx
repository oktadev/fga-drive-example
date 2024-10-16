import { auth0Client } from "@/lib/auth0";
import { redirect } from "next/navigation";

export type AuthRequiredPageProps = {
  children: React.ReactNode;
};

export default async function ({ children }: AuthRequiredPageProps) {
  const session = await auth0Client.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  return { children };
}
