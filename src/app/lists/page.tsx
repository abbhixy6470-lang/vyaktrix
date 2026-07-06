'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function ListsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/list/my').then(({ data }) => {
      if (data.success) setLists(data.data);
    });
  }, [user]);

  const createList = async () => {
    if (!name.trim()) return;
    try {
      const { data } = await api.post('/list/create', { name, description });
      if (data.success) {
        setLists((prev) => [data.data, ...prev]);
        setName('');
        setDescription('');
      }
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
            <h1 className="text-xl font-bold text-white">Lists</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="card">
            <h2 className="font-bold text-white mb-3">Create list</h2>
            <div className="space-y-3">
              <input placeholder="List name" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field text-sm" />
              <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm" />
              <button onClick={createList} disabled={!name.trim()}
                className="btn-primary py-2 px-5 text-sm">Create</button>
            </div>
          </div>
          <div className="space-y-3">
            {lists.map((l) => (
              <div key={l.id} onClick={() => router.push(`/lists/${l.id}`)}
                className="card cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold shrink-0">
                    {l.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white group-hover:text-primary transition">{l.name}</p>
                    {l.description && <p className="text-sm text-gray-500 truncate">{l.description}</p>}
                    <p className="text-xs text-gray-600 mt-0.5">{l.memberCount} members</p>
                  </div>
                </div>
              </div>
            ))}
            {!lists.length && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3 opacity-20">☰</div>
                <p>No lists yet</p>
                <p className="text-sm text-gray-600 mt-1">Create a list to organize users</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListsPage;
