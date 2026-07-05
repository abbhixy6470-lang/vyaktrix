'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
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

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Lists</h1>
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Create List</h2>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <button onClick={createList} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">Create</button>
        </div>
        <div className="space-y-2">
          {lists.map((l) => (
            <div key={l.id} onClick={() => router.push(`/lists/${l.id}`)} className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800">
              <h3 className="font-bold">{l.name}</h3>
              {l.description && <p className="text-sm text-gray-500">{l.description}</p>}
              <p className="text-xs text-gray-600 mt-1">{l.memberCount} members</p>
            </div>
          ))}
          {!lists.length && <p className="text-gray-500 text-sm">No lists yet</p>}
        </div>
      </main>
    </div>
  );
}

export default function Lists() {
  return <AuthProvider><ListsPage /></AuthProvider>;
}
