import type { Metadata } from "next";
import "../globals.css";
import { getSession } from "next-auth/react";
import NextSessionProvider from "@/provider/NextSessionProvider";
import QueryProvider from "@/provider/QueryProvider";

export const metadata: Metadata = {
  title: "Social App | Auth",
  description: "Social App Project | Auth",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession(); 
  return (
    <NextSessionProvider session={session}>
      <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider> 
      </body>
    </html>
    </NextSessionProvider>
  );
}