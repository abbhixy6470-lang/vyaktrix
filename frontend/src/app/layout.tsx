import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vyaktrix 2.0',
  description: 'Modern Social Network Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
