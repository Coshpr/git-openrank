import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GitBranch, UserRound } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GitOpenRank',
  description: 'GitOpenRank',
  icons: {
    icon: '/GitR.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="gitrank" content="GoR" />
      <body className={inter.className}>
        <NuqsAdapter>
          <nav className="border-b bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="text-xl font-bold">GitOpenRank</div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/trending">
                    <Button variant="ghost">GithubTrending</Button>
                  </Link>
                  <Link href="/metrics">
                    <Button variant="ghost">Metrics</Button>
                  </Link>
                  <Link href="/openrank">
                    <Button variant="ghost">OpenRank</Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <div className="">{children}</div>

          <footer className="border-t w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex ">
              <div className="flex">
                <div className="flex gap-2 flex-col">
                  <div>
                    <span className="text-gray-500">
                      © {new Date().getFullYear()}{' '}
                      <a
                        href="https://github.com/Coshpr/git-openrank"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        GitOpenRank
                      </a>
                      . All rights reserved.
                    </span>
                  </div>

                  <div>
                    <div className="flex gap-1 items-center">
                      <GitBranch className="w-4 h-4" />
                      <a
                        href="https://github.com/gitopenrank/"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        GitOpenRank
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-1 items-center">
                      <UserRound className="w-4 h-4" />
                      pangzhangdeng
                    </div>
                  </div>
                </div>
              </div>

              {/* thannks */}
              <div className="flex ml-auto">
                <div className="flex gap-2 flex-col items-end">
                  <div className="flex gap-2 items-center">Thanks to</div>
                  <a
                    href="https://open-digger.cn/docs/user-docs/metrics/metrics-usage-guide"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    OpenDigger
                  </a>
                  <a
                    href="https://openatom-dashboard.x-lab.info/"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    openatom-dashboard
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </NuqsAdapter>
      </body>
    </html>
  );
}
