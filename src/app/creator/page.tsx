'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-r border-gray-800 max-w-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">$</div>
          <h1 className="text-2xl font-bold text-white">Creator Monetization</h1>
        </div>

        <div className="card">
          <h2 className="font-bold text-white mb-4">Your Subscribers ({subscribers.length})</h2>
          {subscribers.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs text-white font-bold">
                {s.subscriberId?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{s.subscriberId?.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{s.tier} — ${s.price}/mo</p>
              </div>
            </div>
          ))}
          {!subscribers.length && <p className="text-sm text-gray-500">No subscribers yet</p>}
        </div>

        <div className="card">
          <h2 className="font-bold text-white mb-4">Subscribe to a creator</h2>
          <div className="space-y-3">
            <input placeholder="Creator user ID" value={creatorId} onChange={(e) => setCreatorId(e.target.value)}
              className="input-field text-sm" />
            <select value={tier} onChange={(e) => setTier(e.target.value)}
              className="input-field text-sm">
              <option value="basic">Basic ($3/mo)</option>
              <option value="premium">Premium ($10/mo)</option>
              <option value="vip">VIP ($25/mo)</option>
            </select>
            <button onClick={subscribe} disabled={!creatorId}
              className="btn-primary py-2 px-5 text-sm">Subscribe</button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-white mb-4">Send a tip</h2>
          <div className="space-y-3">
            <input placeholder="Recipient user ID" value={tipReceiver} onChange={(e) => setTipReceiver(e.target.value)}
              className="input-field text-sm" />
            <input type="number" placeholder="Amount (USD cents)" value={tipAmount} onChange={(e) => setTipAmount(parseInt(e.target.value) || 0)}
              className="input-field text-sm" />
            <button onClick={sendTip} disabled={!tipReceiver || tipAmount <= 0}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm">Send tip</button>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-white mb-4">Your subscriptions</h2>
          {subscriptions.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <p className="text-sm text-white">{s.creatorId?.slice(0, 8)}</p>
              <p className="text-xs text-gray-400">{s.tier} — ${s.price}/mo</p>
            </div>
          ))}
          {!subscriptions.length && <p className="text-sm text-gray-500">No active subscriptions</p>}
        </div>
      </main>
    </div>
  );
}

export default CreatorPage;
