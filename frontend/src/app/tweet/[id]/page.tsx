'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Tweet } from '@/types';

function TweetDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [tweet, setTweet] = useState<Tweet | null>(null);

  useEffect(() => {
    api.get(`/tweet/${params.id}`).then(({ data }) => {
      if (data.success) setTweet(data.data);
    });
  }, [params.id]);

  const handleLike = async () => {
    if (!tweet) return;
    try {
      await api.post(`/tweet/like/${tweet.id}`);
      setTweet((prev) => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
    } catch {}
  };

  if (!tweet) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary" />
            <div>
              <p className="font-bold">@{tweet.authorId?.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">{new Date(tweet.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xl mb-4">{tweet.content}</p>
          <div className="flex items-center gap-6 text-gray-500">
            <button onClick={handleLike} className="flex items-center gap-2 hover:text-primary">♥ {tweet.likeCount}</button>
            <span>💬 {tweet.replyCount}</span>
            <span>🔄 {tweet.retweetCount}</span>
            <span>📑 {tweet.bookmarkCount}</span>
            <span>👁 {tweet.views}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TweetPage({ params }: { params: { id: string } }) {
  return <AuthProvider><TweetDetail params={params} /></AuthProvider>;
}
