/**
 * StaffJoinPage — Deprecated self-registration flow.
 *
 * Staff accounts are now created directly by the Super Admin in the
 * Admin Dashboard → Team tab. New staff members receive their
 * credentials from the admin and log in at /login.
 *
 * This page is kept as a graceful redirect so that any old links
 * do not 404.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';

export default function StaffJoinPage() {
  const navigate = useNavigate();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Lock className="w-8 h-8 text-paper" />
        </div>
        <h1 className="text-3xl font-serif tracking-tight mb-3">Staff Access</h1>
        <p className="text-ink/60 mb-8 leading-relaxed">
          Staff accounts are created directly by the studio owner.
          If you have been given credentials, please sign in at the login page.
        </p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="inline-flex items-center gap-2 px-10 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-accent transition-colors"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </button>
        <p className="mt-6 text-[10px] text-ink/25 uppercase tracking-widest">
          Redirecting automatically…
        </p>
      </motion.div>
    </div>
  );
}
