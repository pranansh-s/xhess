'use client';

import dynamic from 'next/dynamic';

import { ToastContainer } from 'react-toastify';

import { limelight, merriweatherSans } from '@/lib/fonts';
import { Providers } from '@/redux/provider';

import './globals.css';

const BackgroundScene = dynamic(() => import('@/components/landing/BackgroundScene'));
const ProfileBubble = dynamic(() => import('@/components/profile-menu/ProfileBubble'), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <body
        className={`${limelight.variable} ${merriweatherSans.variable} relative h-screen w-screen overflow-clip antialiased`}
      >
        <Providers>
          <ToastContainer />
          <ProfileBubble />
          {children}
          <BackgroundScene />
        </Providers>
      </body>
    </html>
  );
}
