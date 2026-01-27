import { CreditProvider } from '@/contexts/CreditContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { BottomNav } from '@/components/BottomNav';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DracinAja',
  description: 'Nonton drama favoritmu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Telegram WebApp SDK - Must load first */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {/* Monetag SDK */}
        <Script
          src="//libtl.com/sdk.js"
          data-zone="10522796"
          data-sdk="show_10522796"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <CreditProvider>
            <ReferralProvider>
              {children}
              <BottomNav />
            </ReferralProvider>
          </CreditProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
