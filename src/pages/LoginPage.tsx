import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already logged in? Skip to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin', { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1A1714] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="Ashley M. Brows" className="w-16 h-16 mx-auto mb-6 rounded-full object-cover" />
          <p className="text-[#C4A882] text-[10px] uppercase tracking-[0.6em] font-bold">Studio Portal</p>
          <h1 className="text-white text-3xl font-serif mt-2">Ashley M. Brows</h1>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-sm space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm outline-none focus:border-[#C4A882] transition-colors rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm outline-none focus:border-[#C4A882] transition-colors rounded-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#C4A882] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#b8976e] transition-colors disabled:opacity-50 rounded-sm mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Back to site */}
        <p className="text-center mt-8">
          <a href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">
            ← Back to ashleymbrows.com
          </a>
        </p>
      </div>
    </div>
  );
}
