import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured.");
    return Response.json({ ok: false, error: "Cron is not configured." }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Supabase environment variables are missing.");
    return Response.json({ ok: false, error: "Database is not configured." }, { status: 503 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("leads").select("id").limit(1);

  if (error) {
    console.error("Supabase keep-alive failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return Response.json({ ok: false, error: "Database check failed." }, { status: 500 });
  }

  return Response.json(
    { ok: true, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
