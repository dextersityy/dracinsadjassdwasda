import { CreditProvider } from '@/contexts/CreditContext';
import { BottomNav } from '@/components/BottomNav';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DramaBox Mini',
  description: 'Stream your favorite mini-dramas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Monetag SDK */}
        <Script
          src="//libtl.com/sdk.js"
          data-zone="10522796"
          data-sdk="show_10522796"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <CreditProvider>
          {children}
          <BottomNav />
        </CreditProvider>
      </body>
    </html>
  );
}
