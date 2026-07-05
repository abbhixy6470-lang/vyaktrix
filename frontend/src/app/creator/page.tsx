'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

function CreatorPage() {
  const { user, loading } = useAuth();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [tier, setTier] = useState('basic');
  const [price, setPrice] = useState(5);
  const [creatorId, setCreatorId] = useState('');
  const [tipAmount, setTipAmount] = useState(5);
  const [tipReceiver, setTipReceiver] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/creator/subscribers').then(({ data }) => {
      if (data.success) setSubscribers(data.data);
    });
    api.get('/creator/subscriptions').then(({ data }) => {
      if (data.success) setSubscriptions(data.data);
    });
  }, [user]);

  const subscribe = async () => {
    if (!creatorId) return;
    try {
      await api.post('/creator/subscribe', { creatorId, tier, price });
      alert('Subscribed!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const sendTip = async () => {
    if (!tipReceiver || tipAmount <= 0) return;
    try {
      await api.post('/creator/tip', { receiverId: tipReceiver, amount: tipAmount });
      alert('Tip sent!');
    } catch {}
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-4 space-y-4">
        <h1 className="text-xl font-bold">Creator Monetization</h1>

        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Your Subscribers ({subscribers.length})</h2>
          {subscribers.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-700" />
              <span>{s.subscriberId?.slice(0, 8)} - {s.tier} (${s.price}/mo)</span>
            </div>
          ))}
          {!subscribers.length && <p className="text-gray-500 text-sm">No subscribers yet</p>}
        </div>

        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Subscribe to a Creator</h2>
          <input placeholder="Creator user ID" value={creatorId} onChange={(e) => setCreatorId(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm">
            <option value="basic">Basic ($3/mo)</option>
            <option value="premium">Premium ($10/mo)</option>
            <option value="vip">VIP ($25/mo)</option>
          </select>
          <button onClick={subscribe} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">Subscribe</button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">Send a Tip</h2>
          <input placeholder="Recipient user ID" value={tipReceiver} onChange={(e) => setTipReceiver(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <input type="number" placeholder="Amount (USD cents)" value={tipAmount} onChange={(e) => setTipAmount(parseInt(e.target.value) || 0)}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
          <button onClick={sendTip} className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm">Send Tip</button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="font-bold">Your Subscriptions</h2>
          {subscriptions.map((s: any) => (
            <div key={s.id} className="text-sm mt-2">
              {s.creatorId?.slice(0, 8)} - {s.tier} (${s.price}/mo)
            </div>
          ))}
          {!subscriptions.length && <p className="text-gray-500 text-sm mt-2">No active subscriptions</p>}
        </div>
      </main>
    </div>
  );
}

export default function Creator() {
  return <AuthProvider><CreatorPage /></AuthProvider>;
}
