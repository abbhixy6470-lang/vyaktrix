'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function AudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/audio/live').then(({ data }) => {
      if (data.success) setRooms(data.data);
    });
  }, [user]);

  const createRoom = async () => {
    if (!title.trim()) return;
    try {
      const { data } = await api.post('/audio/create', { title, description });
      if (data.success) router.push(`/audio/${data.data.id}`);
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Spaces</h1>
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Start a Space</h2>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <button onClick={createRoom} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">Start</button>
        </div>
        <h2 className="font-bold">Live Now</h2>
        <div className="space-y-2">
          {rooms.map((room) => (
            <div key={room.id} onClick={() => router.push(`/audio/${room.id}`)} className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <h3 className="font-bold">{room.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">{room.listenerCount} listening</p>
            </div>
          ))}
          {!rooms.length && <p className="text-gray-500 text-sm">No active spaces</p>}
        </div>
      </main>
    </div>
  );
}

export default function Audio() {
  return <AuthProvider><AudioPage /></AuthProvider>;
}
