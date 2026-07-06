'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
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
            <h1 className="text-xl font-bold text-white">Bookmarks</h1>
            <p className="text-sm text-gray-500 mt-0.5">Posts you've saved</p>
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {bookmarks.map((b: any) => {
            const tweetContent = b.tweets?.content;
            const tweetId = b.tweets?.id || b.tweetId;
            return (
              <div key={b.bookmarks?.id || b.id || tweetId}
                className="p-5 hover:bg-gray-900/30 cursor-pointer transition animate-fade-in"
                onClick={() => router.push(`/tweet/${tweetId}`)}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shrink-0 shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-white">@{b.tweets?.authorId?.slice(0, 8) || 'unknown'}</span>
                    </div>
                    {tweetContent && (
                      <p className="text-[15px] leading-relaxed text-gray-200 mt-1">{tweetContent}</p>
                    )}
                    {!tweetContent && <p className="text-sm text-gray-500 italic mt-1">Post deleted</p>}
                  </div>
                  <svg className="w-4 h-4 text-primary shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>
            );
          })}
          {!bookmarks.length && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4 opacity-20">📑</div>
              <p className="text-gray-500 text-lg">No bookmarks yet</p>
              <p className="text-gray-600 text-sm mt-1">Save posts by tapping the bookmark icon</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BookmarksPage;
