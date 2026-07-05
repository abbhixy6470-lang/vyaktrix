'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Communities</h1>
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Create Community</h2>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <button onClick={createCommunity} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">Create</button>
        </div>
        <div className="space-y-2">
          {communities.map((c) => (
            <div key={c.id} onClick={() => router.push(`/communities/${c.id}`)} className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800">
              <h3 className="font-bold">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.memberCount} members</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Communities() {
  return <AuthProvider><CommunitiesPage /></AuthProvider>;
}
