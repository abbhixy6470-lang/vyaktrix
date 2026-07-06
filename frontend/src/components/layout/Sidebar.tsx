'use client';

import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { HiHome, HiSearch, HiBell, HiMail, HiBookmark, HiCollection, HiMusicNote, HiUsers, HiLightningBolt, HiDotsHorizontal } from 'react-icons/hi';

const navItems = [
  { href: '/feed', label: 'Home', icon: HiHome },
  { href: '/explore', label: 'Explore', icon: HiSearch },
  { href: '/notifications', label: 'Notifications', icon: HiBell, badge: true },
  { href: '/messages', label: 'Messages', icon: HiMail },
  { href: '/lists', label: 'Lists', icon: HiCollection },
  { href: '/bookmarks', label: 'Bookmarks', icon: HiBookmark },
  { href: '/communities', label: 'Communities', icon: HiUsers },
  { href: '/audio', label: 'Spaces', icon: HiMusicNote },
  { href: '/creator', label: 'Monetization', icon: HiLightningBolt },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <aside className="w-20 xl:w-72 h-screen sticky top-0 flex flex-col bg-black border-r border-gray-800">
      <div className="p-4 xl:p-6">
        <Link href="/" className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          ✦ V
        </Link>
      </div>
      <nav className="flex-1 px-2 xl:px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-4 px-3 xl:px-4 py-3 rounded-2xl transition text-lg group ${
                isActive ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-900 hover:text-white'
              }`}>
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className="hidden xl:inline text-base font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="border-t border-gray-800 p-2 xl:p-4">
          <button onClick={() => router.push(`/profile/${user.id}`)}
            className="flex items-center gap-3 w-full px-3 xl:px-4 py-3 rounded-2xl hover:bg-gray-900 transition group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-primary/30">
              {user.username[0].toUpperCase()}
            </div>
            <div className="hidden xl:block flex-1 min-w-0 text-left">
              <p className="font-semibold text-sm text-white truncate">{user.displayName || user.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
            <HiDotsHorizontal className="hidden xl:block w-5 h-5 text-gray-500 group-hover:text-white transition" />
          </button>
          <button onClick={handleLogout}
            className="hidden xl:block w-full text-left px-4 py-2 mt-1 text-sm text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded-xl transition">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
