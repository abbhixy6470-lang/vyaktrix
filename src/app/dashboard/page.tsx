'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/admin/analytics').then(({ data }) => {
      if (data.success) setAnalytics(data.data);
    }).catch(() => {});
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const stats = [
    { label: 'Your Posts', value: user?.tweetCount || 0, color: 'from-primary to-purple-600' },
    { label: 'Followers', value: user?.followerCount || 0, color: 'from-blue-600 to-cyan-600' },
    { label: 'Following', value: user?.followingCount || 0, color: 'from-emerald-600 to-teal-600' },
    { label: 'Total Users', value: analytics?.users || '-', color: 'from-amber-600 to-orange-600' },
    { label: 'Total Posts', value: analytics?.tweets || '-', color: 'from-pink-600 to-rose-600' },
    { label: 'Reports', value: analytics?.pendingReports || '-', color: 'from-red-600 to-rose-600' },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="card bg-gradient-to-br from-gray-900 to-gray-950 border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.displayName || user.username}</h2>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card text-center hover:scale-[1.02] transition-transform">
                <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} items-center justify-center text-white text-sm font-bold mb-3 shadow-lg`}>
                  {typeof s.value === 'number' ? s.value.toString()[0] : '?'}
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="font-bold text-white mb-3">About</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              This is your Vyaktrix dashboard. View your stats, manage your content, and track platform growth.
              More detailed analytics with charts and graphs are coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
