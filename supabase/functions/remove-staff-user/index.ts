// supabase/functions/remove-staff-user/index.ts
// Removes a staff user: deletes their user_roles row AND their Auth account.
// Only callable by authenticated super_admins.

import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://ashleymbrows.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function json(body: object, status = 200, req: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    // ── 1. Authenticate caller ────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401, req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) return json({ error: 'Invalid session' }, 401, req);

    // ── 2. Verify caller is super_admin ───────────────────────────────────────
    const { data: callerRole } = await callerClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .single();

    if (!callerRole || callerRole.role !== 'super_admin') {
      return json({ error: 'Forbidden — only super_admins can remove staff users' }, 403, req);
    }

    // ── 3. Parse body ─────────────────────────────────────────────────────────
    const { user_id } = await req.json();
    if (!user_id) return json({ error: 'user_id is required' }, 400, req);

    // ── 4. Prevent self-removal ───────────────────────────────────────────────
    if (user_id === callerUser.id) {
      return json({ error: 'You cannot remove yourself' }, 400, req);
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    // ── 5. Verify target is not a super_admin ─────────────────────────────────
    const { data: targetRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .single();

    if (targetRole?.role === 'super_admin') {
      return json({ error: 'Cannot remove a super_admin account' }, 403, req);
    }

    // ── 6. Delete user_roles row ──────────────────────────────────────────────
    const { error: roleDeleteError } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', user_id);

    if (roleDeleteError) {
      console.error('Failed to delete user_roles row:', roleDeleteError);
      return json({ error: 'Failed to remove role: ' + roleDeleteError.message }, 500, req);
    }

    // ── 7. Delete the Auth user ───────────────────────────────────────────────
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user_id);
    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError);
      // role row already deleted — user can't log into the dashboard, but Auth account lingers
      return json({
        success: true,
        warning: 'Role removed but Auth user deletion failed: ' + authDeleteError.message,
      }, 200, req);
    }

    console.log(`Staff user ${user_id} fully removed by ${callerUser.id}`);
    return json({ success: true, user_id }, 200, req);

  } catch (err) {
    console.error('remove-staff-user error:', err);
    return json({ error: 'Internal server error' }, 500, req);
  }
});
