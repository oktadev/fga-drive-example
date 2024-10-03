import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { authorizeRootFolder } from "@/app/authorization";
import { auth0Client } from "@/helpers/auth0";

export const metadata: Metadata = {
  title: "Okta Drive",
  description: "Your cat picture never felt more at",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0Client.getSession();

  if (session) {
    await authorizeRootFolder(session?.user?.sub);
  }

  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
