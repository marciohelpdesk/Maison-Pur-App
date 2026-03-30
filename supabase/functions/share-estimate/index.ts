import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://maisonpur.lovable.app";
const OG_IMAGE = "https://i.ibb.co/1Yh2WJjw/Branding.png";

const BOT_UA = /whatsapp|facebookexternalhit|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandex|baiduspider|pinterest|snapchat/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 400, headers: corsHeaders });
    }

    const redirectUrl = `${APP_URL}/estimate/${token}`;
    const ua = req.headers.get("user-agent") || "";

    if (!BOT_UA.test(ua)) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: redirectUrl },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: estimate } = await supabase
      .from("estimates")
      .select("client_name, estimate_number, amount, status")
      .eq("public_token", token)
      .maybeSingle();

    const statusLabel = estimate
      ? { draft: "Draft", sent: "Sent", accepted: "Accepted", declined: "Declined" }[estimate.status] || estimate.status
      : "";

    const title = estimate
      ? `Maison Pur | Estimate ${estimate.estimate_number || ''} — ${estimate.client_name}`
      : "Maison Pur | Estimate";
    const description = estimate
      ? `Estimate for ${estimate.client_name} · $${Number(estimate.amount).toFixed(2)} · ${statusLabel}`
      : "Professional Estimate by Maison Pur";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${redirectUrl}" />
  <meta property="og:site_name" content="Maison Pur" />
  <meta property="og:image:type" content="image/png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
</head>
<body>
  <p>Redirecting to estimate...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("share-estimate error:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
