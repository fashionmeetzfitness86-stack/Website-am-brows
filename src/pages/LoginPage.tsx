import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, AlertCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ViewState = 'checking' | 'form' | 'access-denied' | 'forgot-sent';

export default function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated with a valid role → go straight to /admin
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('user_roles').select('role').eq('user_id', session.user.id).single();
        if (data?.role === 'super_admin' || data?.role === 'staff') {
          navigate('/admin', { replace: true });
          return;
        }
      }
      setView('form');
    };
    check();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Step 1: Authenticate
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    // Step 2: Check approved role — never default to staff
    const { data: roleData } = await supabase
      .from('user_roles').select('role').eq('user_id', data.user.id).single();

    if (!roleData || !['super_admin', 'staff'].includes(roleData.role)) {
      await supabase.auth.signOut();
      setView('access-denied');
      setLoading(false);
      return;
    }

    navigate('/admin', { replace: true });
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address first, then click Forgot Password.'); return; }
    setLoading(true); setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setLoading(false);
    if (resetError) { setError('Unable to send reset email. Please try again.'); }
    else { setView('forgot-sent'); }
  };

  // ── Loading / session check ───────────────────────────────────────────────
  if (view === 'checking') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FBF8F4 0%, #EFE7DC 100%)' }}>
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-ink p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #7F4F24 0%, transparent 60%), radial-gradient(circle at 20% 80%, #3B2A1A 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-accent text-[10px] uppercase tracking-[0.6em] font-bold mb-8">Ashley M. Brows</p>
          <h2 className="text-4xl font-serif text-paper leading-snug">Studio<br />Management<br />Portal</h2>
        </div>
        <div className="relative z-10 space-y-6">
          {['Consultation Requests', 'Client Management', 'Schedule Control', 'Email Confirmations'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-accent" />
              <span className="text-paper/50 text-xs uppercase tracking-widest font-bold">{item}</span>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-paper/20 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Ashley M. Brows
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 relative">
        {/* Back to site */}
        <motion.a href="/" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute top-8 left-8 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-ink/30 hover:text-accent transition-colors">
          <ChevronLeft className="w-4 h-4" /> Studio Website
        </motion.a>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm">

          {/* Brand mark */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <span className="text-paper font-serif text-xl">A</span>
            </div>
            <h1 className="text-3xl font-serif text-ink mb-1">Welcome back</h1>
            <p className="text-ink/40 text-sm">Sign in to your studio dashboard</p>
          </div>

          {/* ── Access Denied ───────────────────────────────────────────── */}
          {view === 'access-denied' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-serif text-red-900 mb-2">Access Denied</h2>
              <p className="text-sm text-red-600/80 leading-relaxed mb-6">
                Your account is not authorised to access the studio dashboard.
                Contact the studio owner to be added as a staff member.
              </p>
              <button onClick={() => { setView('form'); setEmail(''); setPassword(''); }}
                className="w-full py-3 border border-ink/10 text-[10px] uppercase tracking-widest font-bold text-ink/60 hover:text-ink hover:border-ink/20 transition-colors rounded-xl">
                Try Different Account
              </button>
            </motion.div>
          )}

          {/* ── Forgot Password Sent ────────────────────────────────────── */}
          {view === 'forgot-sent' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-serif text-ink mb-2">Check Your Email</h2>
              <p className="text-sm text-ink/50 leading-relaxed mb-6">
                A password reset link has been sent to <strong>{email}</strong>.
              </p>
              <button onClick={() => setView('form')}
                className="w-full py-3 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors rounded-xl">
                Back to Sign In
              </button>
            </motion.div>
          )}

          {/* ── Login Form ──────────────────────────────────────────────── */}
          {view === 'form' && (
            <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(59,42,26,0.08)] border border-ink/5 p-8">
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/25 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-paper border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded-xl"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-ink/50 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/25 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-paper border border-ink/10 text-sm text-ink placeholder:text-ink/25 outline-none focus:border-accent transition-colors rounded-xl"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/25 hover:text-ink/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-all duration-300 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> Signing In…</>
                    : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              {/* Forgot password */}
              <div className="mt-5 text-center">
                <button onClick={handleForgotPassword} disabled={loading}
                  className="text-[10px] uppercase tracking-widest font-bold text-ink/25 hover:text-accent transition-colors disabled:opacity-50">
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-ink/20 mt-8 uppercase tracking-widest font-bold">
            Private Studio Portal · Ashley M. Brows
          </p>
        </motion.div>
      </div>
    </div>
  );
}
