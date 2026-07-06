'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const router = useRouter();

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = 'Username is required';
    else if (username.length < 3) errs.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = 'Letters, numbers, and underscores only';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'At least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!birthMonth || !birthDay || !birthYear) errs.dob = 'Date of birth is required';
    if (!termsAccepted) errs.terms = 'You must accept the terms';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setError('');
    setLoading(true);
    try {
      const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
      await register(username.trim(), email.trim(), password, dateOfBirth, termsAccepted);
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.field) {
          setFieldErrors({ [err.response.data.field]: err.response.data.error });
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-purple-900/20 to-black items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="max-w-md relative">
          <div className="text-8xl mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">✦</div>
          <h2 className="text-4xl font-bold text-white mb-4">Join Vyaktrix</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Connect with creators, share your voice, and be part of a community that values authentic expression.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
              <span>Create your account with email</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
              <span>Set up your profile preferences</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
              <span>Start connecting with the world</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent lg:hidden">✦ Vyaktrix</div>
            <div className="ml-auto flex gap-1.5">
              <div className={`w-2 h-2 rounded-full transition ${step >= 1 ? 'bg-primary' : 'bg-gray-700'}`} />
              <div className={`w-2 h-2 rounded-full transition ${step >= 2 ? 'bg-primary' : 'bg-gray-700'}`} />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Create account</h1>
          </div>
          <p className="text-gray-500 mb-8">Join millions on Vyaktrix</p>

          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <input type="text" placeholder="yourname" value={username}
                    onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: '' })); }}
                    className={`input-field ${fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
                  {fieldErrors.username && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input type="email" placeholder="name@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                    className={`input-field ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
                  {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                  <input type="password" placeholder="Min 8 characters" value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                    className={`input-field ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required minLength={8} />
                  {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.password}</p>}
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition ${
                        !password ? 'bg-gray-800' :
                        password.length < 6 ? (level <= 1 ? 'bg-red-500' : 'bg-gray-800') :
                        password.length < 10 ? (level <= 2 ? 'bg-yellow-500' : 'bg-gray-800') :
                        (level <= 3 ? 'bg-green-500' : 'bg-gray-800')
                      }`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Confirm password</label>
                  <input type="password" placeholder="Re-enter password" value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    className={`input-field ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
                  {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.confirmPassword}</p>}
                </div>
                <button type="button" onClick={handleNext}
                  className="w-full btn-primary py-3.5 text-base">
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date of birth</label>
                  <p className="text-xs text-gray-600 mb-3">This will not be shown publicly. Confirm your age.</p>
                  <div className="flex gap-3">
                    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                      className="input-field flex-1 text-sm">
                      <option value="">Month</option>
                      {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
                      className="input-field w-20 text-sm">
                      <option value="">Day</option>
                      {days.map((d) => <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>)}
                    </select>
                    <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                      className="input-field flex-1 text-sm">
                      <option value="">Year</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  {fieldErrors.dob && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.dob}</p>}
                </div>

                <div className="card border-gray-700/50">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                      termsAccepted ? 'bg-primary border-primary' : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="hidden" />
                      {termsAccepted && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        I agree to the{' '}
                        <button type="button" className="text-primary hover:underline font-medium">Terms of Service</button>
                        ,{' '}
                        <button type="button" className="text-primary hover:underline font-medium">Privacy Policy</button>
                        , and{' '}
                        <button type="button" className="text-primary hover:underline font-medium">Cookie Policy</button>.
                        By creating an account, you acknowledge that you are at least 13 years old.
                      </p>
                    </div>
                  </label>
                  {fieldErrors.terms && <p className="text-red-400 text-xs mt-2 ml-8">{fieldErrors.terms}</p>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 btn-secondary py-3.5 text-base">Back</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 btn-primary py-3.5 text-base">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-8 text-gray-500 text-sm text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return <AuthProvider><RegisterPage /></AuthProvider>;
}
