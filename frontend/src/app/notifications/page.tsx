'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import { useRouter } from 'next/navigation';

function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications').then(({ data }) => {
      if (data.success) setNotifications(data.data);
    });
  }, [user]);

  const markRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button onClick={markRead} className="text-sm text-primary hover:underline">Mark all read</button>
        </div>
        <div className="divide-y divide-gray-800">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 ${!n.isRead ? 'bg-gray-900/50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div>
                  <p className="text-sm">{n.content || `${n.type} notification`}</p>
                  <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
          {!notifications.length && <p className="p-8 text-center text-gray-500">No notifications yet</p>}
        </div>
      </main>
    </div>
  );
}

export default function Notifications() {
  return <AuthProvider><NotificationsPage /></AuthProvider>;
}
