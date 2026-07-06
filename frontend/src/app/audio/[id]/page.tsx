'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function AudioRoomPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
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

  if (!room) return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="flex items-center gap-4 px-6 py-4">
            <button onClick={() => router.push('/audio')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-800 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold text-white">Space</h1>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{room.title}</h1>
          {room.description && <p className="text-gray-400 mb-2">{room.description}</p>}
          <div className="flex items-center justify-center gap-2 text-sm mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-dot" />
            <span className="text-gray-500">{room.listenerCount} listening</span>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={joinRoom} className="btn-primary px-8 py-3">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                Join
              </span>
            </button>
            <button onClick={leaveRoom} className="btn-secondary px-8 py-3">Leave</button>
          </div>

          <div className="mt-10 text-left">
            <h3 className="font-bold text-white mb-4">Participants</h3>
            <div className="space-y-3">
              {room.participants?.map((p: any) => (
                <div key={p.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                    {p.userId?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{p.userId?.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{p.role}</p>
                  </div>
                  {p.isSpeaking && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />}
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
