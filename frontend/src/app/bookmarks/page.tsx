'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function BookmarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get('/tweet/bookmarks/all').then(({ data }) => {
      if (data.success) setBookmarks(data.data);
    });
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Bookmarks</h1>
        </div>
        <div className="divide-y divide-gray-800">
          {bookmarks.map((b: any) => (
            <div key={b.bookmarks?.id || b.id} className="p-4 hover:bg-gray-900/50 cursor-pointer" onClick={() => router.push(`/tweet/${b.tweets?.id || b.tweetId}`)}>
              <p className="text-sm">{b.tweets?.content || '(deleted)'}</p>
            </div>
          ))}
          {!bookmarks.length && <p className="p-8 text-center text-gray-500">No bookmarks yet</p>}
        </div>
      </main>
    </div>
  );
}

export default function Bookmarks() {
  return <AuthProvider><BookmarksPage /></AuthProvider>;
}
