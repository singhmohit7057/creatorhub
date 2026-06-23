import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller is an authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // Check caller is admin role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') return json({ error: 'Forbidden' }, 403)

    const { targetUserId, adminPassword } = await req.json()
    if (!targetUserId || !adminPassword) return json({ error: 'Missing fields' }, 400)

    // Verify admin password by signing in
    const { error: signInError } = await anonClient.auth.signInWithPassword({
      email: user.email!,
      password: adminPassword,
    })
    if (signInError) return json({ error: 'Incorrect password' }, 403)

    // Delete the target user via service role
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteError) return json({ error: deleteError.message }, 500)

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
