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
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/user/update', { displayName, bio, website, location });
      if (data.success) {
        updateUser(data.data);
        setMsg('Profile updated successfully');
        setMsgType('success');
      }
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Update failed');
      setMsgType('error');
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/user/change-password', { currentPassword, newPassword });
      setMsg('Password changed');
      setMsgType('success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Failed');
      setMsgType('error');
    }
  };

  const deactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return;
    try {
      await api.post('/user/deactivate');
      await logout();
      router.push('/auth/login');
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-6 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl text-white font-bold shadow-xl shadow-primary/30">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            msgType === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {msg}
          </div>
        )}

        <form onSubmit={updateProfile} className="card">
          <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Display name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="input-field" placeholder="Your display name" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="input-field resize-none" placeholder="Tell the world about yourself" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)}
                className="input-field" placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                className="input-field" placeholder="Where are you based?" />
            </div>
            <button type="submit" className="btn-primary text-sm">Save profile</button>
          </div>
        </form>

        <form onSubmit={changePassword} className="card">
          <h2 className="text-lg font-bold text-white mb-4">Password</h2>
          <div className="space-y-4">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field" placeholder="Current password" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="input-field" placeholder="New password" />
            <button type="submit" className="btn-primary text-sm">Change password</button>
          </div>
        </form>

        <div className="card border-red-500/20">
          <h2 className="text-lg font-bold text-red-400 mb-2">Danger zone</h2>
          <p className="text-sm text-gray-500 mb-4">Deactivate your account permanently. This cannot be undone.</p>
          <button onClick={deactivate} className="btn-danger text-sm">Deactivate account</button>
        </div>
      </main>
    </div>
  );
}

export default function Settings() {
  return <AuthProvider><SettingsPage /></AuthProvider>;
}
