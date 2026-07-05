'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Vyaktrix</h1>
        <p className="text-gray-500 mb-8">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" required />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition">
            Sign In
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm text-center">
          Don&apos;t have an account? <Link href="/auth/register" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return <AuthProvider><LoginPage /></AuthProvider>;
}
