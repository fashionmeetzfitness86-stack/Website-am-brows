/**
 * AdminRoute — Protected route wrapper.
 *
 * Behavior:
 * - Shows spinner while checking Supabase session
 * - Redirects to /login if no session exists
 * - Redirects to /login if session exists but user has no approved user_roles row
 * - Only allows 'super_admin' and 'staff' roles — never defaults to staff for unknown users
 * - Renders children once access is confirmed
 */
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Status = 'loading' | 'allowed' | 'redirect-login';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('redirect-login');
        return;
      }

      // SECURITY: Require an explicit approved role — never default to staff
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData && ['super_admin', 'staff'].includes(roleData.role)) {
        setStatus('allowed');
      } else {
        // Has session but no approved role — sign out and redirect to login
        await supabase.auth.signOut();
        setStatus('redirect-login');
      }
    };

    check();

    // Re-check if session changes (e.g. another tab signs out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setStatus('redirect-login');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-ink/30">Verifying access…</p>
      </div>
    );
  }

  if (status === 'redirect-login') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
