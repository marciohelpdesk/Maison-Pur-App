import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate calling user via getClaims
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callingUserId = claimsData.claims.sub;

    // Parse request body
    const { email, action, memberId } = await req.json();

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Handle remove member action
    if (action === "remove") {
      if (!memberId) {
        return new Response(JSON.stringify({ error: "memberId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get member info before deleting
      const { data: member } = await adminClient
        .from("team_members")
        .select("member_user_id")
        .eq("id", memberId)
        .eq("admin_id", callingUser.id)
        .single();

      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete team membership
      await adminClient.from("team_members").delete().eq("id", memberId);

      // Update invite status
      const { data: memberUser } = await adminClient.auth.admin.getUserById(member.member_user_id);
      if (memberUser?.user?.email) {
        await adminClient
          .from("team_invites")
          .update({ status: "revoked" })
          .eq("admin_id", callingUser.id)
          .eq("email", memberUser.user.email);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle invite action
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already invited
    const { data: existingInvite } = await adminClient
      .from("team_invites")
      .select("id, status")
      .eq("admin_id", callingUser.id)
      .eq("email", normalizedEmail)
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: "Already invited" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate temporary password
    const tempPassword = `Clean${Math.random().toString(36).slice(2, 10)}!${Math.floor(Math.random() * 100)}`;

    // Create user account
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { invited_by: callingUser.id },
    });

    if (createError) {
      // User might already exist
      if (createError.message?.includes("already been registered")) {
        // Get existing user
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const existingUser = users?.find((u) => u.email === normalizedEmail);

        if (existingUser) {
          // Add cleaner role
          await adminClient.from("user_roles").upsert(
            { user_id: existingUser.id, role: "cleaner" },
            { onConflict: "user_id,role" }
          );

          // Create team membership
          await adminClient.from("team_members").upsert(
            { admin_id: callingUser.id, member_user_id: existingUser.id },
            { onConflict: "admin_id,member_user_id" }
          );

          // Record invite
          await adminClient.from("team_invites").insert({
            admin_id: callingUser.id,
            email: normalizedEmail,
            status: "accepted",
          });

          return new Response(JSON.stringify({
            success: true,
            message: "Existing user added to team",
            isExisting: true,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add cleaner role
    await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "cleaner",
    });

    // Create team membership
    await adminClient.from("team_members").insert({
      admin_id: callingUser.id,
      member_user_id: newUser.user.id,
    });

    // Record invite
    await adminClient.from("team_invites").insert({
      admin_id: callingUser.id,
      email: normalizedEmail,
      status: "accepted",
    });

    return new Response(JSON.stringify({
      success: true,
      tempPassword,
      email: normalizedEmail,
      message: "Team member created successfully",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
