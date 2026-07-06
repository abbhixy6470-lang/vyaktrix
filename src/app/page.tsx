'use client';

import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, tweets: 0 });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    api.get('/admin/analytics').then(({ data }) => {
      if (data.success) setStats(data.data);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
  if (!user) return null;

  const quickActions = [
    { icon: '✧', label: 'Compose', href: '/tweet/compose', color: 'from-primary to-purple-600' },
    { icon: '◎', label: 'Explore', href: '/explore', color: 'from-blue-600 to-cyan-600' },
    { icon: '♢', label: 'Messages', href: '/messages', color: 'from-emerald-600 to-teal-600' },
    { icon: '♡', label: 'Notifications', href: '/notifications', color: 'from-pink-600 to-rose-600' },
    { icon: '▣', label: 'Profile', href: `/profile/${user.id}`, color: 'from-amber-600 to-orange-600' },
    { icon: '◈', label: 'Spaces', href: '/audio', color: 'from-violet-600 to-purple-600' },
    { icon: '◇', label: 'Communities', href: '/communities', color: 'from-indigo-600 to-blue-600' },
    { icon: '⊞', label: 'Lists', href: '/lists', color: 'from-teal-600 to-emerald-600' },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-gray-800">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-white">Home</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="card mb-6 bg-gradient-to-br from-gray-900 to-gray-950 border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/30">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.displayName || user.username}</h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-sm text-gray-500">
                {user.verified && <span className="text-primary">✓ Verified</span>}
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <span><strong className="text-white">{user.followingCount}</strong> <span className="text-gray-500">Following</span></span>
              <span><strong className="text-white">{user.followerCount}</strong> <span className="text-gray-500">Followers</span></span>
              <span><strong className="text-white">{user.tweetCount}</strong> <span className="text-gray-500">Posts</span></span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {quickActions.map((item) => (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 text-left text-white hover:scale-[1.02] transition-transform shadow-lg`}>
                <div className="text-2xl mb-2 opacity-80">{item.icon}</div>
                <div className="font-semibold text-sm">{item.label}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-bold text-white">{stats.users || '-'}</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-white">{stats.tweets || '-'}</p>
              <p className="text-xs text-gray-500">Tweets</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-white">{user.tweetCount}</p>
              <p className="text-xs text-gray-500">Your posts</p>
            </div>
          </div>
        </div>
      </main>
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
