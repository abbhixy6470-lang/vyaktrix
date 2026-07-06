'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
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
            <h1 className="text-xl font-bold text-white">Spaces</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="card bg-gradient-to-br from-gray-900 to-gray-950 border-primary/20">
            <h2 className="font-bold text-white mb-3">Start a space</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm" />
              <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm" />
              <button onClick={createRoom} disabled={!title.trim()}
                className="btn-primary py-2 px-5 text-sm">Start</button>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white mb-3">Live now</h2>
            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} onClick={() => router.push(`/audio/${room.id}`)}
                  className="card cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg shrink-0">
                        ♪
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 animate-pulse-dot border-2 border-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white group-hover:text-primary transition">{room.title}</p>
                      {room.description && <p className="text-sm text-gray-500 truncate">{room.description}</p>}
                      <p className="text-xs text-green-400 mt-1">{room.listenerCount} listening</p>
                    </div>
                  </div>
                </div>
              ))}
              {!rooms.length && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3 opacity-20">♪</div>
                  <p>No active spaces</p>
                  <p className="text-sm text-gray-600 mt-1">Start one to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AudioPage;
