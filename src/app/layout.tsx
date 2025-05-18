
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'reactflow/dist/style.css'; // Import ReactFlow styles
import { AppProvider } from '@/contexts/AppProvider';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/context/SidebarContext'; // Import SidebarProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Task Ticker',
  description: 'Manage your tasks efficiently with Task Ticker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <SidebarProvider> {/* Wrap content with SidebarProvider */}
 {children}
            <Toaster />
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  );
}
