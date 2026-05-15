// supabase/functions/create-staff-user/index.ts
// Creates a Supabase Auth user and assigns them the 'staff' role.
// Only callable by authenticated super_admins.
// Uses SUPABASE_SERVICE_ROLE_KEY (server-side only, never exposed to browser).

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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // ── 1. Authenticate the caller (must be a logged-in super_admin) ──────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401, req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Verify the caller's JWT with the anon client
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) return json({ error: 'Invalid session' }, 401, req);

    // Check that caller is a super_admin
    const { data: callerRole } = await callerClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .single();

    if (!callerRole || callerRole.role !== 'super_admin') {
      return json({ error: 'Forbidden — only super_admins can create staff users' }, 403, req);
    }

    // ── 2. Parse request body ──────────────────────────────────────────────────
    const { email, full_name, password } = await req.json();
    if (!email || !full_name || !password) {
      return json({ error: 'email, full_name, and password are required' }, 400, req);
    }

    // ── 3. Create the auth user with service role ──────────────────────────────
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation — admin is creating this user
    });

    if (createError) return json({ error: createError.message }, 400, req);

    // ── 4. Insert into user_roles ──────────────────────────────────────────────
    const { error: roleError } = await adminClient.from('user_roles').insert({
      user_id:    newUser.user!.id,
      email:      email.toLowerCase(),
      full_name:  full_name.trim(),
      role:       'staff',
      invited_by: callerUser.id,
    });

    if (roleError) return json({ error: `User created but role assignment failed: ${roleError.message}` }, 500, req);

    return json({ success: true, user_id: newUser.user!.id, email, role: 'staff' }, 200, req);

  } catch (err) {
    console.error('create-staff-user error:', err);
    return json({ error: 'Internal server error' }, 500, req);
  }
});
