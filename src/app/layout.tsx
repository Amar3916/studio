import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/toaster';
import AppShell from '@/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScholarAI',
  description: 'Your personal AI assistant for finding scholarships.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
