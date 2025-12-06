import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenRank Dashboard",
  description: "OpenRank metrics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NuqsAdapter>
          <nav className="border-b bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="text-xl font-bold">OpenRank Dashboard</div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/trending">
                    <Button variant="ghost">Trending</Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="ghost">Search</Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}