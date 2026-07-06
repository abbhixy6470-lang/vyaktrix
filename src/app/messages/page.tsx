'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
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
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>
        </div>
        <div className="p-4 border-b border-gray-800/50">
          <div className="card">
            <h3 className="text-sm font-bold text-white mb-3">New message</h3>
            <div className="flex gap-2">
              <input placeholder="Recipient user ID" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}
                className="input-field flex-1 text-sm py-2.5" />
              <input placeholder="Message" value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="input-field flex-1 text-sm py-2.5" />
              <button onClick={sendMessage} disabled={!receiverId || !content.trim()}
                className="btn-primary py-2 px-4 text-sm">Send</button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {conversations.map((conv, i) => (
            <Link key={i} href={`/messages/${conv.senderId || conv.receiverId}`}
              className="flex items-center gap-4 p-5 hover:bg-gray-900/30 transition group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                {(conv.senderId || conv.receiverId || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">User {(conv.senderId || conv.receiverId)?.slice(0, 8)}</p>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
          {!conversations.length && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4 opacity-20">✉</div>
              <p className="text-gray-500 text-lg">No conversations yet</p>
              <p className="text-gray-600 text-sm mt-1">Send a message to someone to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MessagesPage;
