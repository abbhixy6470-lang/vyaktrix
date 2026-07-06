'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function CommunitiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/community').then(({ data }) => {
      if (data.success) setCommunities(data.data);
    });
  }, [user]);

  const createCommunity = async () => {
    if (!name.trim()) return;
    try {
      const { data } = await api.post('/community/create', { name, description });
      if (data.success) router.push(`/communities/${data.data.id}`);
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
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-white">Communities</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="card">
            <h2 className="font-bold text-white mb-3">Create community</h2>
            <div className="space-y-3">
              <input placeholder="Community name" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field text-sm" />
              <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm" />
              <button onClick={createCommunity} disabled={!name.trim()}
                className="btn-primary py-2 px-5 text-sm">Create</button>
            </div>
          </div>
          <div className="space-y-3">
            {communities.map((c) => (
              <div key={c.id} onClick={() => router.push(`/communities/${c.id}`)}
                className="card cursor-pointer group flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-primary transition">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.memberCount} members</p>
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
            {!communities.length && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3 opacity-20">◆</div>
                <p>No communities yet</p>
                <p className="text-sm text-gray-600 mt-1">Create one to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommunitiesPage;
