'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { User, Tweet } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ProfilePage({ params }: { params: { id: string } }) {
  const { user: me } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tab, setTab] = useState<'tweets' | 'media' | 'likes'>('tweets');

  useEffect(() => {
    api.get(`/user/${params.id}`).then(({ data }) => {
      if (data.success) setProfile(data.data);
    });
  }, [params.id]);

  useEffect(() => {
    if (!profile) return;
    const endpoint = tab === 'media' ? `/tweet/user/${params.id}/media` : tab === 'likes' ? `/tweet/likes/${params.id}` : `/tweet/user/${params.id}`;
    api.get(endpoint).then(({ data }) => {
      if (data.success) setTweets(data.data);
    });
  }, [profile, tab, params.id]);

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/user/follow/${params.id}`);
      setProfile((prev) => prev ? {
        ...prev,
        followerCount: data.message === 'Followed' ? prev.followerCount + 1 : prev.followerCount - 1,
        isFollowing: data.message === 'Followed',
      } : null);
    } catch {}
  };

  if (!profile) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="h-48 bg-gradient-to-r from-primary to-purple-600" />
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-12">
            <div className="w-24 h-24 rounded-full border-4 border-black bg-gray-700 flex items-center justify-center text-3xl text-white font-bold">
              {profile.username[0].toUpperCase()}
            </div>
            {me && me.id !== profile.id && (
              <button onClick={handleFollow}
                className={`mt-14 px-4 py-2 rounded-full font-bold text-sm border ${profile.isFollowing ? 'border-gray-600 text-white' : 'bg-white text-black'}`}>
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <div className="mt-2">
            <h2 className="text-xl font-bold">{profile.displayName || profile.username}</h2>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.website && <Link href={profile.website} className="text-primary hover:underline">🔗 {profile.website}</Link>}
              {profile.verified && <span className="text-primary">✓ Verified</span>}
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span><strong className="text-white">{profile.followingCount}</strong> Following</span>
              <span><strong className="text-white">{profile.followerCount}</strong> Followers</span>
            </div>
          </div>
        </div>
        <div className="flex border-b border-gray-800">
          {(['tweets', 'media', 'likes'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium text-center ${tab === t ? 'border-b-2 border-primary text-white' : 'text-gray-500 hover:bg-gray-900'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="divide-y divide-gray-800">
          {tweets.map((tweet: any) => (
            <div key={tweet.id || tweet.tweets_id || tweet.tweets?.id} className="p-4 hover:bg-gray-900/50 cursor-pointer" onClick={() => router.push(`/tweet/${tweet.id || tweet.tweets?.id}`)}>
              <p className="text-sm">{tweet.content || tweet.tweets?.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Profile({ params }: { params: { id: string } }) {
  return <AuthProvider><ProfilePage params={params} /></AuthProvider>;
}
