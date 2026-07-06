'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function CommunityDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<any>(null);

  useEffect(() => {
    api.get(`/community/${params.id}`).then(({ data }) => {
      if (data.success) setCommunity(data.data);
    });
  }, [params.id]);

  const join = async () => {
    try {
      await api.post(`/community/join/${params.id}`);
      const { data } = await api.get(`/community/${params.id}`);
      if (data.success) setCommunity(data.data);
    } catch {}
  };

  const leave = async () => {
    try {
      await api.post(`/community/leave/${params.id}`);
      const { data } = await api.get(`/community/${params.id}`);
      if (data.success) setCommunity(data.data);
    } catch {}
  };

  if (!community) return (
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
        <div className="relative h-48 bg-gradient-to-r from-primary via-purple-600 to-pink-600">
          <button onClick={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
            ←
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-black bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-xl shadow-primary/30">
              {community.name[0].toUpperCase()}
            </div>
            <div className="flex gap-2">
              <button onClick={join} className="btn-primary py-2 px-5 text-sm">Join</button>
              <button onClick={leave} className="btn-secondary py-2 px-5 text-sm">Leave</button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{community.name}</h1>
          {community.description && <p className="text-gray-400 mb-2">{community.description}</p>}
          <p className="text-sm text-gray-500">{community.memberCount} members</p>

          {community.rules && (
            <div className="mt-6 card">
              <h3 className="font-bold text-white mb-2">Rules</h3>
              <p className="text-sm text-gray-400">{community.rules}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-bold text-white mb-4">Members ({community.members?.length || 0})</h3>
            <div className="space-y-2">
              {community.members?.map((m: any) => (
                <div key={m.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                    {m.userId?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{m.userId?.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommunityDetail;
