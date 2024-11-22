import type { Metadata } from "next";
import "../globals.css";
import { getSession } from "next-auth/react";
import NextSessionProvider from "@/provider/NextSessionProvider";
import QueryProvider from "@/provider/QueryProvider";
import PageContent from "@/components/ui/PageContent";
import { SocketContextProvider } from "@/provider/SocketContext";
import { requestUser } from "@/services/apiUsers"; 

export const metadata: Metadata = {
  title: "Social App",
  description: "Social App Project",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let currentUser = null;
  if (session?.user?.email) {
    try {
      currentUser = await requestUser(session.user.email); 
    } catch (error) {
      console.error("User fetch failed:", error);
    }
  }

  return (
    <NextSessionProvider session={session}>
      <html lang="en">
        <body>
          <SocketContextProvider currentUser={currentUser}>
            <QueryProvider>
              <PageContent>{children}</PageContent>
            </QueryProvider>
          </SocketContextProvider>
        </body>
      </html>
    </NextSessionProvider>
  );
}
