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
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4">
        <div className="flex gap-2 mb-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search Vyaktrix" className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <button onClick={handleSearch} className="bg-primary text-white px-4 py-2 rounded-full text-sm">Search</button>
        </div>

        {!searched && (
          <div>
            <h2 className="font-bold mb-3">Trending</h2>
            <div className="space-y-2">
              {trends.map((t: any) => (
                <Link key={t.id} href={`/tweet/feed/hashtag/${t.hashtag}`} className="block bg-gray-900 rounded-xl p-3 hover:bg-gray-800">
                  <p className="font-bold">#{t.hashtag}</p>
                  <p className="text-sm text-gray-500">{t.tweetCount} tweets</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {searched && (
          <div className="space-y-4">
            {users.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Users</h3>
                {users.map((u: any) => (
                  <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700" />
                    <div>
                      <p className="font-bold">{u.displayName || u.username}</p>
                      <p className="text-sm text-gray-500">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {tweets.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Tweets</h3>
                {tweets.map((t: any) => (
                  <div key={t.id} className="p-3 hover:bg-gray-900 rounded-lg cursor-pointer" onClick={() => router.push(`/tweet/${t.id}`)}>
                    <p className="text-sm">{t.content}</p>
                  </div>
                ))}
              </div>
            )}
            {hashtags.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Hashtags</h3>
                {hashtags.map((h: any) => (
                  <Link key={h.id || h.hashtag} href={`/tweet/feed/hashtag/${h.hashtag}`} className="block p-3 hover:bg-gray-900 rounded-lg">
                    <p className="font-bold">#{h.hashtag}</p>
                    <p className="text-sm text-gray-500">{h.tweetCount} tweets</p>
                  </Link>
                ))}
              </div>
            )}
            {!users.length && !tweets.length && !hashtags.length && <p className="text-gray-500 text-center">No results for "{query}"</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Explore() {
  return <AuthProvider><ExplorePage /></AuthProvider>;
}
