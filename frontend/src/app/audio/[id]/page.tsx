'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

function AudioRoomPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    api.get(`/audio/${params.id}`).then(({ data }) => {
      if (data.success) setRoom(data.data);
    });
  }, [params.id]);

  const joinRoom = async () => {
    try {
      await api.post(`/audio/join/${params.id}`);
      const { data } = await api.get(`/audio/${params.id}`);
      if (data.success) setRoom(data.data);
    } catch {}
  };

  const leaveRoom = async () => {
    try {
      await api.post(`/audio/leave/${params.id}`);
      const { data } = await api.get(`/audio/${params.id}`);
      if (data.success) setRoom(data.data);
    } catch {}
  };

  if (!room) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <div className="bg-gray-900 rounded-xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">🎙</span>
          </div>
          <h1 className="text-2xl font-bold">{room.title}</h1>
          {room.description && <p className="text-gray-500 mt-2">{room.description}</p>}
          <p className="text-sm text-gray-500 mt-1">{room.listenerCount} listening</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={joinRoom} className="bg-primary text-white px-6 py-2 rounded-full font-bold">Join</button>
            <button onClick={leaveRoom} className="border border-gray-600 text-white px-6 py-2 rounded-full font-bold">Leave</button>
          </div>
          <div className="mt-6">
            <h3 className="font-bold text-left mb-3">Participants</h3>
            <div className="space-y-2 text-left">
              {room.participants?.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700" />
                  <span className="text-sm">{p.role} - {p.userId?.slice(0, 8)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AudioRoom({ params }: { params: { id: string } }) {
  return <AuthProvider><AudioRoomPage params={params} /></AuthProvider>;
}
