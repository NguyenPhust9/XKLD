import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.consent) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin bắt buộc." },
        { status: 400 },
      );
    }

    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error("Supabase environment variables are missing.");
      return NextResponse.json(
        { error: "Máy chủ chưa được cấu hình cơ sở dữ liệu." },
        { status: 500 },
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("leads").insert({
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      gender: body.gender || null,
      region: body.region || null,
      birth_year: body.birth_year || null,
      province: body.province || null,
      note: body.note || null,
      program: body.program || null,
    });

    if (error) {
      console.error("Supabase insert failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: "Không thể lưu đăng ký. Vui lòng thử lại." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead API failed:", error);
    return NextResponse.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }
}
