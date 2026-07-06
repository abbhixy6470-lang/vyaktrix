'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function ListDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
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

  if (!list) return (
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
            <button onClick={() => router.push('/lists')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-800 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold text-white">{list.name}</h1>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
                {list.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{list.name}</h2>
                {list.description && <p className="text-sm text-gray-400 mt-1">{list.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{list.members?.length || 0} members</p>
              </div>
            </div>
          </div>

          {list.ownerId === user?.id && (
            <div className="card">
              <h3 className="font-bold text-white text-sm mb-3">Add member</h3>
              <div className="flex gap-2">
                <input placeholder="User ID" value={addUserId} onChange={(e) => setAddUserId(e.target.value)}
                  className="input-field flex-1 text-sm py-2.5" />
                <button onClick={addMember} disabled={!addUserId.trim()}
                  className="btn-primary py-2 px-4 text-sm">Add</button>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-white mb-4">Members ({list.members?.length || 0})</h3>
            <div className="space-y-2">
              {list.members?.map((m: any) => (
                <div key={m.id} className="card flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                      {m.userId?.[0]?.toUpperCase() || '?'}
                    </div>
                    <p className="text-sm text-white font-medium">{m.userId?.slice(0, 8)}</p>
                  </div>
                  {list.ownerId === user?.id && (
                    <button onClick={() => removeMember(m.userId)}
                      className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition">Remove</button>
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

export default ListDetail;
