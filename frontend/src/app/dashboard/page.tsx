'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

function DashboardPage() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    api.get('/admin/analytics').then(({ data }) => {
      if (data.success) setAnalytics(data.data);
    }).catch(() => {});
  }, [user]);

  const stats = [
    { label: 'Your Tweets', value: user?.tweetCount || 0 },
    { label: 'Followers', value: user?.followerCount || 0 },
    { label: 'Following', value: user?.followingCount || 0 },
    { label: 'Total Users', value: analytics?.users || '-' },
    { label: 'Total Tweets', value: analytics?.tweets || '-' },
    { label: 'Reports', value: analytics?.pendingReports || '-' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-900 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold mb-3">Recent Activity</h2>
          <p className="text-sm text-gray-500">Analytics dashboard with charts coming soon. Connect to your postgres database to view detailed metrics.</p>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return <AuthProvider><DashboardPage /></AuthProvider>;
}
