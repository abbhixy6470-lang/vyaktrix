'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">Join Vyaktrix</h1>
        <p className="text-gray-500 mb-8">Create your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary" required minLength={8} />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm text-center">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return <AuthProvider><RegisterPage /></AuthProvider>;
}
