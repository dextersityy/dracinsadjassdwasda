import { CreditProvider } from '@/contexts/CreditContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ReferralProvider } from '@/contexts/ReferralContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { BottomNav } from '@/components/BottomNav';
import { GlobalMiniPlayer } from '@/components/GlobalMiniPlayer';
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
        {/* Telegram WebApp SDK - Raw script for better compatibility */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        {/* Adsgram SDK */}
        <script src="https://sad.adsgram.ai/js/sad.min.js"></script>
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <CreditProvider>
            <ReferralProvider>
              <PlayerProvider>
                {children}
                <GlobalMiniPlayer />
                <BottomNav />
              </PlayerProvider>
            </ReferralProvider>
          </CreditProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
