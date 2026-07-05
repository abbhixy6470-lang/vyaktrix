'use client';

import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Home</h1>
        </div>
        <FeedView />
      </main>
    </div>
  );
}

function FeedView() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-gray-400 text-sm">Welcome back, {user?.displayName || user?.username}!</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/feed', label: 'Timeline', desc: 'View your feed' },
          { href: '/tweet/compose', label: 'Compose', desc: 'Create a tweet' },
          { href: '/notifications', label: 'Notifications', desc: 'Check activity' },
          { href: '/messages', label: 'Messages', desc: 'View DMs' },
          { href: '/profile/' + user?.id, label: 'Profile', desc: 'Your profile' },
          { href: '/explore', label: 'Explore', desc: 'Discover trends' },
          { href: '/audio', label: 'Spaces', desc: 'Audio rooms' },
          { href: '/communities', label: 'Communities', desc: 'Groups' },
          { href: '/lists', label: 'Lists', desc: 'Curated feeds' },
          { href: '/creator', label: 'Monetization', desc: 'Earn revenue' },
          { href: '/settings', label: 'Settings', desc: 'Account settings' },
          { href: '/dashboard', label: 'Dashboard', desc: 'Analytics' },
        ].map((item) => (
          <button key={item.href} onClick={() => router.push(item.href)}
            className="bg-gray-900 rounded-xl p-4 text-left hover:bg-gray-800 transition">
            <h3 className="font-bold">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}
