import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.phone || !body.consent) return NextResponse.json({ error: "Vui lòng điền đủ thông tin." }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    const { error } = await supabase.from("leads").insert({
      name: body.name,
      phone: body.phone,
      email: body.email ?? null,
      gender: body.gender ?? null,
      region: body.region ?? null,
      birth_year: body.birth_year ?? null,
      province: body.province ?? null,
      note: body.note ?? null,
      program: body.program ?? null,
    });
    if (error) return NextResponse.json({ error: "Không thể lưu đăng ký." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}