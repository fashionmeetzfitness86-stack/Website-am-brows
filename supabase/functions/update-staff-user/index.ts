import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Only allow requests from authenticated super admins
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the calling user is a super_admin
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (roleRow?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: only super admins can update staff.' }), { status: 403, headers: corsHeaders });
    }

    const { user_id, full_name, email, password, role } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400, headers: corsHeaders });

    // 1. Update auth user (email / password) — only if provided
    const authUpdates: Record<string, string> = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authErr } = await adminClient.auth.admin.updateUserById(user_id, authUpdates);
      if (authErr) return new Response(JSON.stringify({ error: authErr.message }), { status: 400, headers: corsHeaders });
    }

    // 2. Update user_roles row (full_name, email, role)
    const roleUpdates: Record<string, string> = {};
    if (full_name) roleUpdates.full_name = full_name;
    if (email) roleUpdates.email = email;
    if (role) roleUpdates.role = role;

    if (Object.keys(roleUpdates).length > 0) {
      const { error: roleErr } = await adminClient
        .from('user_roles')
        .update(roleUpdates)
        .eq('user_id', user_id);
      if (roleErr) return new Response(JSON.stringify({ error: roleErr.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
