'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Tweet } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tab, setTab] = useState<'home' | 'following' | 'trending'>('home');
  const [composeContent, setComposeContent] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/tweet/feed/${tab}`).then(({ data }) => {
      if (data.success) setTweets(data.data);
    });
  }, [user, tab]);

  const handleTweet = async () => {
    if (!composeContent.trim()) return;
    try {
      const { data } = await api.post('/tweet/create', { content: composeContent });
      if (data.success) {
        setTweets((prev) => [data.data, ...prev]);
        setComposeContent('');
      }
    } catch {}
  };

  const handleLike = async (tweetId: string) => {
    try {
      await api.post(`/tweet/like/${tweetId}`);
      setTweets((prev) => prev.map((t) => t.id === tweetId ? { ...t, likeCount: t.liked ? t.likeCount - 1 : t.likeCount + 1, liked: !t.liked } : t));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-4 mb-4">
            {(['home', 'following', 'trending'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-900'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea placeholder="What's happening?" value={composeContent} onChange={(e) => setComposeContent(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg" rows={3} maxLength={280} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{composeContent.length}/280</span>
                <button onClick={handleTweet} disabled={!composeContent.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full font-bold text-sm disabled:opacity-50">
                  Tweet
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="p-4 hover:bg-gray-900/50 transition cursor-pointer" onClick={() => router.push(`/tweet/${tweet.id}`)}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">@{tweet.authorId?.slice(0, 8)}</span>
                    <span className="text-gray-500 text-xs">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{tweet.content}</p>
                  <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm">
                    <button onClick={(e) => { e.stopPropagation(); handleLike(tweet.id); }} className="flex items-center gap-1 hover:text-primary">
                      ♥ {tweet.likeCount}
                    </button>
                    <span className="flex items-center gap-1">💬 {tweet.replyCount}</span>
                    <span className="flex items-center gap-1">🔄 {tweet.retweetCount}</span>
                    <span className="flex items-center gap-1">📑 {tweet.bookmarkCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!tweets.length && <p className="p-8 text-center text-gray-500">No tweets yet. Be the first!</p>}
        </div>
      </main>
    </div>
  );
}

export default function Feed() {
  return <AuthProvider><FeedPage /></AuthProvider>;
}
