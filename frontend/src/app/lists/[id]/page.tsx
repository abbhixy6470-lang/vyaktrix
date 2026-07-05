'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

function ListDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [list, setList] = useState<any>(null);
  const [addUserId, setAddUserId] = useState('');

  useEffect(() => {
    api.get(`/list/${params.id}`).then(({ data }) => {
      if (data.success) setList(data.data);
    });
  }, [params.id]);

  const addMember = async () => {
    if (!addUserId.trim()) return;
    try {
      await api.post('/list/add', { listId: params.id, userId: addUserId });
      const { data } = await api.get(`/list/${params.id}`);
      if (data.success) setList(data.data);
      setAddUserId('');
    } catch {}
  };

  const removeMember = async (userId: string) => {
    try {
      await api.delete('/list/remove', { data: { listId: params.id, userId } });
      const { data } = await api.get(`/list/${params.id}`);
      if (data.success) setList(data.data);
    } catch {}
  };

  if (!list) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <div className="bg-gray-900 rounded-xl p-6">
          <h1 className="text-2xl font-bold">{list.name}</h1>
          {list.description && <p className="text-gray-500 mt-1">{list.description}</p>}
          {list.ownerId === user?.id && (
            <div className="flex gap-2 mt-4">
              <input placeholder="Add user ID" value={addUserId} onChange={(e) => setAddUserId(e.target.value)}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <button onClick={addMember} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
            </div>
          )}
          <div className="mt-6">
            <h3 className="font-bold mb-3">Members ({list.members?.length || 0})</h3>
            <div className="space-y-2">
              {list.members?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-black rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700" />
                    <span className="text-sm">{m.userId?.slice(0, 8)}</span>
                  </div>
                  {list.ownerId === user?.id && (
                    <button onClick={() => removeMember(m.userId)} className="text-red-400 text-sm">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ListPage({ params }: { params: { id: string } }) {
  return <AuthProvider><ListDetail params={params} /></AuthProvider>;
}
