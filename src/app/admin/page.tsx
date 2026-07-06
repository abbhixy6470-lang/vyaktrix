'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tab, setTab] = useState<'reports' | 'users' | 'analytics'>('reports');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    api.get('/admin/reports').then(({ data }) => { if (data.success) setReports(data.data); }).catch(() => {});
    api.get('/admin/analytics').then(({ data }) => { if (data.success) setAnalytics(data.data); }).catch(() => {});
    api.get('/admin/users').then(({ data }) => { if (data.success) setUsersList(data.data); }).catch(() => {});
  }, [user]);

  const handleAction = async (reportId: string, action: string, targetUserId?: string, targetTweetId?: string) => {
    try {
      await api.post('/admin/action', { reportId, action, targetUserId, targetTweetId });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </div>

        <div className="flex gap-2">
          {(['analytics', 'reports', 'users'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                tab === t ? 'bg-primary text-white' : 'text-gray-500 bg-gray-900 hover:bg-gray-800'
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'analytics' && analytics && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Users', value: analytics.users },
              { label: 'Posts', value: analytics.tweets },
              { label: 'Pending Reports', value: analytics.pendingReports },
            ].map((s) => (
              <div key={s.label} className="card text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">{r.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reporter: {r.reporterId?.slice(0, 8)}{' · '}
                      Target: {r.reportedUserId?.slice(0, 8) || r.reportedTweetId?.slice(0, 8)}
                    </p>
                  </div>
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">Pending</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.id, 'suspend', r.reportedUserId)}
                    className="bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/30 transition">Suspend</button>
                  <button onClick={() => handleAction(r.id, 'delete_tweet', undefined, r.reportedTweetId)}
                    className="bg-orange-600/20 text-orange-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600/30 transition">Delete post</button>
                  <button onClick={() => handleAction(r.id, 'dismiss')}
                    className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-600 transition">Dismiss</button>
                </div>
              </div>
            ))}
            {!reports.length && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3 opacity-20">✓</div>
                <p>No pending reports</p>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            {usersList.map((u: any) => (
              <div key={u.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold">
                    {(u.displayName || u.username)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-500">@{u.username}{' · '}{u.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('', 'suspend', u.id)}
                    className="bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600/30 transition">Suspend</button>
                  <button onClick={() => handleAction('', 'shadowban', u.id)}
                    className="bg-yellow-600/20 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-600/30 transition">Shadowban</button>
                </div>
              </div>
            ))}
            {!usersList.length && <p className="text-center text-gray-500 py-8">No users found</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
