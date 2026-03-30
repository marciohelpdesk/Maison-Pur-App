import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://maisonpur.lovable.app";
const OG_IMAGE = "https://i.ibb.co/1Yh2WJjw/Branding.png";

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

    const redirectUrl = `${APP_URL}/r/${token}`;

    // Fetch report data for OG tags
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: report } = await supabase
      .from("cleaning_reports")
      .select("property_name, cleaner_name, cleaning_date, public_token")
      .eq("public_token", token)
      .eq("status", "published")
      .maybeSingle();

    const title = report ? `Maison Pur | ${report.property_name}` : "Maison Pur | Visit Report";
    const description = report
      ? `Visit Report for ${report.property_name} — ${report.cleaner_name}`
      : "Cleaning Visit Report by Maison Pur";

    // Always serve OG HTML for all visitors
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
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
</head>
<body>
  <p>Redirecting to report...</p>
  <script>window.location.href = "${redirectUrl}";</script>
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
    console.error("share-report error:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
