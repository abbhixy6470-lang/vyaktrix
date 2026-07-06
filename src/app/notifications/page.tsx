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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            <button onClick={markRead}
              className="text-sm font-medium text-primary hover:text-primary-light transition">Mark all read</button>
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {notifications.map((n) => (
            <div key={n.id} className={`p-5 transition ${!n.isRead ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-lg ${
                  n.type === 'like' ? 'bg-pink-500/20 text-pink-500' :
                  n.type === 'follow' ? 'bg-primary/20 text-primary' :
                  n.type === 'retweet' ? 'bg-green-500/20 text-green-500' :
                  n.type === 'reply' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {n.type === 'like' ? '♥' : n.type === 'follow' ? '+' : n.type === 'retweet' ? '↻' : n.type === 'reply' ? '↩' : ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{n.content || `${n.type} notification`}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
            </div>
          ))}
          {!notifications.length && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4 opacity-20">☰</div>
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-600 text-sm mt-1">When people interact with you, they'll show up here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Notifications() {
  return <AuthProvider><NotificationsPage /></AuthProvider>;
}
