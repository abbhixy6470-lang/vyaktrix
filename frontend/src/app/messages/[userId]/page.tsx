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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl flex flex-col">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="flex items-center gap-4 px-6 py-4">
            <button onClick={() => router.push('/messages')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-800 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold shrink-0">
              {params.userId[0].toUpperCase()}
            </div>
            <h1 className="text-lg font-bold text-white">User {params.userId.slice(0, 8)}</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3" style={{ minHeight: '400px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                msg.senderId === user.id
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1.5 ${msg.senderId === user.id ? 'text-white/60' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {!messages.length && (
            <div className="text-center py-16 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm text-gray-600 mt-1">Send a message to start the conversation</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-md">
          <div className="flex gap-3">
            <input value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-5 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition" />
            <button onClick={sendMessage} disabled={!content.trim()}
              className="w-11 h-11 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Thread({ params }: { params: { userId: string } }) {
  return <AuthProvider><MessageThread params={params} /></AuthProvider>;
}
