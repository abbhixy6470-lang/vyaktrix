'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Tweet } from '@/types';
import { useRouter } from 'next/navigation';

function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tab, setTab] = useState<'home' | 'following' | 'trending'>('home');
  const [composeContent, setComposeContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    if (!composeContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/tweet/create', { content: composeContent });
      if (data.success) {
        setTweets((prev) => [data.data, ...prev]);
        setComposeContent('');
      }
    } catch {}
    setSubmitting(false);
  };

  const handleLike = async (tweetId: string) => {
    try {
      await api.post(`/tweet/like/${tweetId}`);
      setTweets((prev) => prev.map((t) => t.id === tweetId ? { ...t, likeCount: t.likeCount + 1 } : t));
    } catch {}
  };

  const handleRetweet = async (tweetId: string) => {
    try {
      await api.post(`/tweet/retweet/${tweetId}`);
      setTweets((prev) => prev.map((t) => t.id === tweetId ? { ...t, retweetCount: t.retweetCount + 1 } : t));
    } catch {}
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
          <div className="flex items-center gap-2 px-6 py-4">
            {(['home', 'following', 'trending'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-900'
                }`}>
                {t === 'home' ? 'For you' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-primary/30">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea placeholder="What is happening?" value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-600 resize-none outline-none text-lg leading-relaxed" rows={3} maxLength={280} />
              <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                <span className={`text-sm font-medium ${composeContent.length > 260 ? 'text-warning' : 'text-gray-500'}`}>
                  {composeContent.length}/280
                </span>
                <button onClick={handleTweet} disabled={!composeContent.trim() || submitting}
                  className="btn-primary py-2 px-5 text-sm">
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="p-5 hover:bg-gray-900/30 transition cursor-pointer animate-fade-in">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 shrink-0 shadow-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">@{tweet.authorId?.slice(0, 8)}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500 text-xs">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-200 whitespace-pre-wrap">{tweet.content}</p>
                  <div className="flex items-center gap-8 mt-4 text-gray-500">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/tweet/${tweet.id}`); }}
                      className="flex items-center gap-2 text-sm hover:text-primary transition group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span>{tweet.replyCount}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.id); }}
                      className="flex items-center gap-2 text-sm hover:text-green-500 transition group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      <span>{tweet.retweetCount}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleLike(tweet.id); }}
                      className="flex items-center gap-2 text-sm hover:text-pink-500 transition group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <span>{tweet.likeCount}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); }}
                      className="flex items-center gap-2 text-sm hover:text-primary transition group">
                      <svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      <span>{tweet.bookmarkCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!tweets.length && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4 opacity-20">✦</div>
              <p className="text-gray-500 text-lg">No posts yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to share something</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Feed() {
  return <AuthProvider><FeedPage /></AuthProvider>;
}
