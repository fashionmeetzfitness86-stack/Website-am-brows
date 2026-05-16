import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StaffJoinPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify if email is invited
    const { data: invite, error: inviteError } = await supabase
      .from('staff_invites')
      .select('*')
      .eq('email', email)
      .single();

    if (inviteError || !invite) {
      setError('This email has not been invited. Please contact the studio owner.');
      setLoading(false);
      return;
    }

    // Sign up
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // Success! Auto-assigned role via trigger. Redirect to admin.
      navigate('/admin', { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="w-8 h-8 text-paper" />
          </div>
          <h1 className="text-3xl font-serif tracking-tight mb-2">Join Staff</h1>
          <p className="text-ink/60">Create your account to access the dashboard.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-ink/5">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-paper-dark/50 border border-ink/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-accent focus:bg-white outline-none transition-all" placeholder="Jane Doe" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 pl-1">Email Address</label>
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-paper-dark/50 border border-ink/10 rounded-xl py-3 pl-4 pr-4 text-sm focus:border-accent focus:bg-white outline-none transition-all" placeholder="Enter your invited email" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 pl-1">Create Password</label>
              <div className="relative">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6}
                  className="w-full bg-paper-dark/50 border border-ink/10 rounded-xl py-3 pl-4 pr-4 text-sm focus:border-accent focus:bg-white outline-none transition-all" placeholder="Min. 6 characters" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-4 bg-ink text-paper py-4 rounded-xl text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Creating Account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
