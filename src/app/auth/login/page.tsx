'use client';

import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-purple-900/20 to-black items-center justify-center p-12">
        <div className="max-w-md">
          <div className="text-8xl mb-6">✦</div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back</h2>
          <p className="text-gray-400 text-lg">Connect with the world. Share your thoughts. Join the conversation.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-3xl font-bold text-primary mb-8 lg:hidden">✦ Vyaktrix</div>
          <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
          <p className="text-gray-500 mb-8">to continue to Vyaktrix</p>
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input type="email" placeholder="name@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-8 text-gray-500 text-sm text-center">
            No account?{' '}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
