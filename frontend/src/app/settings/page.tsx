'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [location, setLocation] = useState(user?.location || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/user/update', { displayName, bio, website, location });
      if (data.success) {
        updateUser(data.data);
        setMsg('Profile updated');
      }
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Update failed');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/user/change-password', { currentPassword, newPassword });
      setMsg('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Failed');
    }
  };

  const deactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your account?')) return;
    try {
      await api.post('/user/deactivate');
      await logout();
      router.push('/auth/login');
    } catch {}
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-6">
        <h1 className="text-xl font-bold">Settings</h1>
        {msg && <div className="bg-gray-900 text-gray-300 p-3 rounded-lg text-sm">{msg}</div>}

        <form onSubmit={updateProfile} className="space-y-4 bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold">Profile</h2>
          <input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <input placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Save</button>
        </form>

        <form onSubmit={changePassword} className="space-y-4 bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold">Change Password</h2>
          <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Change</button>
        </form>

        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold text-red-400">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-3">Permanently deactivate your account</p>
          <button onClick={deactivate} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Deactivate Account</button>
        </div>
      </main>
    </div>
  );
}

export default function Settings() {
  return <AuthProvider><SettingsPage /></AuthProvider>;
}
