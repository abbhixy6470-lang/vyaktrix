'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ProfilePage({ params }: { params: { id: string } }) {
  const { user: me } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [tweets, setTweets] = useState<any[]>([]);
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
      setProfile((prev: any) => prev ? {
        ...prev,
        followerCount: data.message === 'Followed' ? prev.followerCount + 1 : prev.followerCount - 1,
        isFollowing: data.message === 'Followed',
      } : null);
    } catch {}
  };

  if (!profile) return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="h-56 bg-gradient-to-r from-primary via-purple-600 to-pink-600 relative">
          <button onClick={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50 transition">
            ←
          </button>
        </div>
        <div className="relative px-6 pb-6">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-black bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-xl shadow-primary/30">
              {profile.username[0].toUpperCase()}
            </div>
            {me && me.id !== profile.id && (
              <button onClick={handleFollow}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  profile.isFollowing
                    ? 'border border-gray-600 text-white hover:border-red-500 hover:text-red-400 hover:bg-red-500/10'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}>
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{profile.displayName || profile.username}</h2>
              {profile.verified && <span className="text-primary">✓</span>}
            </div>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-gray-300 leading-relaxed">{profile.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.website && (
                <Link href={profile.website} className="text-primary hover:underline flex items-center gap-1">
                  🔗 {profile.website.replace(/^https?:\/\//, '')}
                </Link>
              )}
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <span><strong className="text-white font-bold">{profile.followingCount}</strong> <span className="text-gray-500">Following</span></span>
              <span><strong className="text-white font-bold">{profile.followerCount}</strong> <span className="text-gray-500">Followers</span></span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-800">
          {(['tweets', 'media', 'likes'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-medium text-center transition ${
                tab === t ? 'border-b-2 border-primary text-white' : 'text-gray-500 hover:bg-gray-900'
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-800/50">
          {tweets.map((tweet: any) => (
            <div key={tweet.id || tweet.tweets_id || tweet.tweets?.id}
              className="p-5 hover:bg-gray-900/30 cursor-pointer transition animate-fade-in"
              onClick={() => router.push(`/tweet/${tweet.id || tweet.tweets?.id}`)}>
              <p className="text-[15px] leading-relaxed text-gray-200">{tweet.content || tweet.tweets?.content}</p>
              <p className="text-xs text-gray-600 mt-2">{new Date(tweet.createdAt || tweet.tweets?.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {!tweets.length && (
            <div className="p-16 text-center text-gray-500">
              <p className="text-lg">No posts yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Profile({ params }: { params: { id: string } }) {
  return <AuthProvider><ProfilePage params={params} /></AuthProvider>;
}
