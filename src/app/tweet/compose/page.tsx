'use client';

import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function ComposePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [sensitive, setSensitive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) { router.push('/auth/login'); return null; }

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/tweet/create', { content, sensitive });
      if (data.success) router.push(`/tweet/${data.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="flex items-center gap-4 px-6 py-4">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-800 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <span className="text-lg font-bold text-white">Compose</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-primary/30">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea placeholder="What's happening?" value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-600 resize-none outline-none text-xl leading-relaxed" rows={6} maxLength={280} autoFocus />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                <label className="flex items-center gap-3 text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${sensitive ? 'bg-warning' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${sensitive ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span>Mark as sensitive</span>
                  <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} className="hidden" />
                </label>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${content.length > 260 ? 'text-warning' : 'text-gray-500'}`}>
                    {content.length}/280
                  </span>
                  <button onClick={handleSubmit} disabled={!content.trim() || submitting}
                    className="btn-primary py-2.5 px-6 text-sm">
                    {submitting ? 'Posting...' : 'Tweet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ComposePage;
