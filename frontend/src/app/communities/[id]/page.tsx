'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

function CommunityDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
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

  if (!community) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <div className="bg-gray-900 rounded-xl p-6">
          <h1 className="text-2xl font-bold">{community.name}</h1>
          {community.description && <p className="text-gray-500 mt-2">{community.description}</p>}
          <p className="text-sm text-gray-500 mt-1">{community.memberCount} members</p>
          <div className="flex gap-3 mt-4">
            <button onClick={join} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">Join</button>
            <button onClick={leave} className="border border-gray-600 text-white px-4 py-2 rounded-full font-bold text-sm">Leave</button>
          </div>
          {community.rules && (
            <div className="mt-4 p-3 bg-black rounded-lg">
              <h3 className="font-bold text-sm mb-2">Rules</h3>
              <p className="text-sm text-gray-400">{community.rules}</p>
            </div>
          )}
          {community.members && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">Members ({community.members.length})</h3>
              <div className="space-y-2">
                {community.members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700" />
                    <span className="text-sm">{m.role} - {m.userId?.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CommunityPage({ params }: { params: { id: string } }) {
  return <AuthProvider><CommunityDetail params={params} /></AuthProvider>;
}
