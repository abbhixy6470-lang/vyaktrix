'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ExplorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [tweets, setTweets] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    try {
      const [u, t, h, tr] = await Promise.all([
        api.get(`/search/users?q=${query}`),
        api.get(`/search/tweets?q=${query}`),
        api.get(`/search/hashtags?q=${query}`),
        api.get('/search/trends'),
      ]);
      if (u.data.success) setUsers(u.data.data);
      if (t.data.success) setTweets(t.data.data);
      if (h.data.success) setHashtags(h.data.data);
      if (tr.data.success) setTrends(tr.data.data);
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-black/70 border-b border-gray-800">
          <div className="px-6 py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search Vyaktrix" className="w-full bg-gray-900 border border-gray-700 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
              </div>
              <button onClick={handleSearch} className="btn-primary py-2 px-5 text-sm">Search</button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!searched && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Trending today</h2>
              <div className="space-y-3">
                {trends.map((t: any, i: number) => (
                  <Link key={t.id || i} href={`/tweet/feed/hashtag/${t.hashtag}`} className="card flex items-center justify-between group">
                    <div>
                      <p className="font-bold text-white group-hover:text-primary transition">#{t.hashtag}</p>
                      <p className="text-sm text-gray-500">{t.tweetCount} posts</p>
                    </div>
                    <span className="text-sm text-gray-600">{i + 1}</span>
                  </Link>
                ))}
                {!trends.length && <p className="text-gray-500 text-center py-8">No trends available</p>}
              </div>
            </div>
          )}

          {searched && (
            <div className="space-y-6">
              {users.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3">Users</h3>
                  <div className="space-y-2">
                    {users.map((u: any) => (
                      <Link key={u.id} href={`/profile/${u.id}`} className="card flex items-center gap-4 group">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{u.displayName || u.username}</p>
                          <p className="text-sm text-gray-500">@{u.username}</p>
                        </div>
                        <span className="text-primary text-sm group-hover:underline">View</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {tweets.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3">Posts</h3>
                  <div className="space-y-2">
                    {tweets.map((t: any) => (
                      <div key={t.id} className="card cursor-pointer group" onClick={() => router.push(`/tweet/${t.id}`)}>
                        <p className="text-sm text-gray-200 line-clamp-2">{t.content}</p>
                        <p className="text-xs text-gray-600 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hashtags.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3">Hashtags</h3>
                  <div className="space-y-2">
                    {hashtags.map((h: any) => (
                      <Link key={h.id || h.hashtag} href={`/tweet/feed/hashtag/${h.hashtag}`} className="card group">
                        <p className="font-bold text-white group-hover:text-primary transition">#{h.hashtag}</p>
                        <p className="text-sm text-gray-500">{h.tweetCount} posts</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {!users.length && !tweets.length && !hashtags.length && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">?</div>
                  <p className="text-gray-500 text-lg">No results for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Explore() {
  return <AuthProvider><ExplorePage /></AuthProvider>;
}
