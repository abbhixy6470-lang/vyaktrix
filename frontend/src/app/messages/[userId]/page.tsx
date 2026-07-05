'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Message } from '@/types';
import { useRouter } from 'next/navigation';

function MessageThread({ params }: { params: { userId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/message/thread/${params.userId}`).then(({ data }) => {
      if (data.success) setMessages(data.data);
    });
  }, [user, params.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await api.post('/message/send', { receiverId: params.userId, content });
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setContent('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Chat with {params.userId.slice(0, 8)}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl px-4 py-2 ${msg.senderId === user.id ? 'bg-primary' : 'bg-gray-800'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..." className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary" />
            <button onClick={sendMessage} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Thread({ params }: { params: { userId: string } }) {
  return <AuthProvider><MessageThread params={params} /></AuthProvider>;
}
