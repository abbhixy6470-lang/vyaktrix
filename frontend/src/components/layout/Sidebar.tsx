'use client';

import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { HiHome, HiSearch, HiBell, HiMail, HiUser, HiDotsHorizontal, HiBookmark, HiCollection, HiGlobe, HiMusicNote, HiUsers, HiLightningBolt } from 'react-icons/hi';

const navItems = [
  { href: '/feed', label: 'Home', icon: HiHome },
  { href: '/explore', label: 'Explore', icon: HiSearch },
  { href: '/notifications', label: 'Notifications', icon: HiBell },
  { href: '/messages', label: 'Messages', icon: HiMail },
  { href: '/lists', label: 'Lists', icon: HiCollection },
  { href: '/bookmarks', label: 'Bookmarks', icon: HiBookmark },
  { href: '/communities', label: 'Communities', icon: HiUsers },
  { href: '/audio', label: 'Spaces', icon: HiMusicNote },
  { href: '/creator', label: 'Monetization', icon: HiLightningBolt },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-20 xl:w-64 h-screen sticky top-0 border-r border-gray-800 p-2 flex flex-col">
      <div className="text-2xl font-bold text-primary px-4 py-4">V</div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-900 transition text-lg">
            <item.icon className="w-6 h-6" />
            <span className="hidden xl:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
      {user && (
        <div className="border-t border-gray-800 pt-2">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-900">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="hidden xl:block flex-1 min-w-0">
              <p className="font-bold truncate">{user.displayName || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
            <HiDotsHorizontal className="hidden xl:block w-5 h-5" />
          </Link>
          <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-900 rounded-full">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
