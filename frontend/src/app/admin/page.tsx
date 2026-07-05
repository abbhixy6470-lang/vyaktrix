'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'reports' | 'users' | 'analytics'>('reports');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    api.get('/admin/reports').then(({ data }) => { if (data.success) setReports(data.data); }).catch(() => {});
    api.get('/admin/analytics').then(({ data }) => { if (data.success) setAnalytics(data.data); }).catch(() => {});
    api.get('/admin/users').then(({ data }) => { if (data.success) setUsers(data.data); }).catch(() => {});
  }, [user]);

  const handleAction = async (reportId: string, action: string, targetUserId?: string, targetTweetId?: string) => {
    try {
      await api.post('/admin/action', { reportId, action, targetUserId, targetTweetId });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-black p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="flex gap-2 mb-4">
        {(['reports', 'users', 'analytics'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === t ? 'bg-primary text-white' : 'bg-gray-900 text-gray-400'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{analytics.users}</p>
            <p className="text-sm text-gray-500">Users</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{analytics.tweets}</p>
            <p className="text-sm text-gray-500">Tweets</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{analytics.pendingReports}</p>
            <p className="text-sm text-gray-500">Pending Reports</p>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="bg-gray-900 rounded-xl p-4">
              <p className="text-sm"><strong>Reason:</strong> {r.reason}</p>
              <p className="text-xs text-gray-500">Reporter: {r.reporterId?.slice(0, 8)} | Target: {r.reportedUserId?.slice(0, 8) || r.reportedTweetId?.slice(0, 8)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleAction(r.id, 'suspend', r.reportedUserId)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Suspend User</button>
                <button onClick={() => handleAction(r.id, 'delete_tweet', undefined, r.reportedTweetId)} className="bg-orange-600 text-white px-3 py-1 rounded text-xs">Delete Tweet</button>
                <button onClick={() => handleAction(r.id, 'dismiss')} className="bg-gray-700 text-white px-3 py-1 rounded text-xs">Dismiss</button>
              </div>
            </div>
          ))}
          {!reports.length && <p className="text-gray-500 text-sm">No pending reports</p>}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{u.displayName || u.username}</p>
                <p className="text-sm text-gray-500">@{u.username} | Role: {u.role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction('', 'suspend', u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Suspend</button>
                <button onClick={() => handleAction('', 'shadowban', u.id)} className="bg-yellow-600 text-white px-3 py-1 rounded text-xs">Shadowban</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return <AuthProvider><AdminPage /></AuthProvider>;
}
