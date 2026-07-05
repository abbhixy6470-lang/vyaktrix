'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function ComposePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [sensitive, setSensitive] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) { router.push('/auth/login'); return null; }

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await api.post('/tweet/create', { content, sensitive });
      if (data.success) router.push(`/tweet/${data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <h1 className="text-xl font-bold mb-4">Compose Tweet</h1>
        <div className="bg-gray-900 rounded-xl p-4">
          <textarea placeholder="What's happening?" value={content} onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg" rows={6} maxLength={280} />
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} />
              Mark as sensitive
            </label>
            <span className="text-sm text-gray-500">{content.length}/280</span>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSubmit} disabled={!content.trim()}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold disabled:opacity-50">
              Tweet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Compose() {
  return <AuthProvider><ComposePage /></AuthProvider>;
}
