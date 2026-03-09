import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function getOrCreateVapidKeys() {
  // Check if keys exist in app_config
  const { data: existing } = await supabaseAdmin
    .from("app_config")
    .select("key, value")
    .in("key", ["vapid_public_key", "vapid_private_key"]);

  if (existing && existing.length === 2) {
    const publicKey = existing.find((r: any) => r.key === "vapid_public_key")?.value;
    const privateKey = existing.find((r: any) => r.key === "vapid_private_key")?.value;
    return { publicKey, privateKey };
  }

  // Generate new keys
  const vapidKeys = webpush.generateVAPIDKeys();

  await supabaseAdmin.from("app_config").upsert([
    { key: "vapid_public_key", value: vapidKeys.publicKey },
    { key: "vapid_private_key", value: vapidKeys.privateKey },
  ], { onConflict: "key" });

  return { publicKey: vapidKeys.publicKey, privateKey: vapidKeys.privateKey };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();

    // ACTION: get-vapid-key (public, no auth needed)
    if (action === "get-vapid-key") {
      const { publicKey } = await getOrCreateVapidKeys();
      return new Response(JSON.stringify({ publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // All other actions require auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const userId = claimsData.claims.sub;

    // ACTION: subscribe
    if (action === "subscribe") {
      const { subscription } = body;
      const { endpoint, keys } = subscription;

      await supabaseAdmin.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        { onConflict: "user_id,endpoint" }
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: unsubscribe
    if (action === "unsubscribe") {
      const { endpoint } = body;
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", endpoint);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: send (internal - for cron/triggers)
    if (action === "send") {
      const { targetUserId, title, message, url } = body;
      const { publicKey, privateKey } = await getOrCreateVapidKeys();

      webpush.setVapidDetails(
        "mailto:support@maisonpur.com",
        publicKey,
        privateKey
      );

      const { data: subscriptions } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", targetUserId || userId);

      if (!subscriptions?.length) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload = JSON.stringify({ title, body: message, url: url || "/" });
      let sent = 0;

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
          sent++;
        } catch (err: any) {
          // Remove expired subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
        }
      }

      return new Response(JSON.stringify({ sent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: send-reminders (for cron job)
    if (action === "send-reminders") {
      const { publicKey, privateKey } = await getOrCreateVapidKeys();
      webpush.setVapidDetails("mailto:support@maisonpur.com", publicKey, privateKey);

      // Find jobs starting in the next 30 minutes
      const now = new Date();
      const in30min = new Date(now.getTime() + 30 * 60 * 1000);
      const todayStr = now.toISOString().split("T")[0];

      const { data: jobs } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("date", todayStr)
        .eq("status", "Scheduled");

      if (!jobs?.length) {
        return new Response(JSON.stringify({ reminders: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let reminders = 0;
      for (const job of jobs) {
        // Parse job time (e.g., "14:00")
        const [hours, minutes] = (job.time || "00:00").split(":").map(Number);
        const jobTime = new Date(now);
        jobTime.setHours(hours, minutes, 0, 0);

        // Check if job is within 25-35 min window
        const diff = jobTime.getTime() - now.getTime();
        if (diff > 0 && diff <= 35 * 60 * 1000 && diff >= 25 * 60 * 1000) {
          const { data: subs } = await supabaseAdmin
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", job.user_id);

          const payload = JSON.stringify({
            title: `⏰ Job in 30 min`,
            body: `${job.client_name} - ${job.address}`,
            url: `/job/${job.id}`,
          });

          for (const sub of subs || []) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
              );
              reminders++;
            } catch (err: any) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ reminders }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
