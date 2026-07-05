'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/message/conversations').then(({ data }) => {
      if (data.success) setConversations([...data.data.sent, ...data.data.received]);
    });
  }, [user]);

  const sendMessage = async () => {
    if (!receiverId || !content.trim()) return;
    try {
      await api.post('/message/send', { receiverId, content });
      setContent('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2">
            <input placeholder="Recipient user ID" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Message" value={content} onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <button onClick={sendMessage} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Send</button>
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {conversations.map((conv, i) => (
            <Link key={i} href={`/messages/${conv.userId}`} className="flex items-center gap-3 p-4 hover:bg-gray-900/50">
              <div className="w-10 h-10 rounded-full bg-gray-700" />
              <div>
                <p className="text-sm font-bold">User {conv.userId?.slice(0, 8)}</p>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            </Link>
          ))}
          {!conversations.length && <p className="p-8 text-center text-gray-500">No conversations yet</p>}
        </div>
      </main>
    </div>
  );
}

export default function Messages() {
  return <AuthProvider><MessagesPage /></AuthProvider>;
}
