import type { Metadata } from 'next';
import '../components/AppLauncherClasses';
import './globals.css';
import Providers from './Providers';

export const metadata: Metadata = {
  title: 'NexStock WMS',
  description: 'Warehouse Management System by NexOne',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
