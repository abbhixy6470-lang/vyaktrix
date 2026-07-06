'use client';

import { AuthProvider } from '@/store/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
