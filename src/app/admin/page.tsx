import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CalendarDays, LogOut, MapPinned, RefreshCw, UserRoundCheck, UsersRound } from "lucide-react";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../lib/admin-auth";
import LeadTable, { type Lead } from "./lead-table";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Quản lý đăng ký | Jinmu",
  description: "Danh sách khách hàng đã gửi biểu mẫu tư vấn.",
  robots: { index: false, follow: false },
};

async function getLeads(): Promise<{ leads: Lead[]; error: string | null }> {
  await connection();

  const cookieStore = await cookies();
  if (!await verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return { leads: [], error: "Chưa cấu hình kết nối cơ sở dữ liệu Supabase." };
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("leads")
    .select("id,name,phone,email,gender,region,birth_year,province,note,program,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Unable to load leads:", error);
    return { leads: [], error: "Không thể tải danh sách đăng ký. Vui lòng thử lại sau." };
  }

  return { leads: (data ?? []) as Lead[], error: null };
}

function isToday(value: string) {
  const now = new Date();
  const date = new Date(value);
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

export default async function AdminPage() {
  const { leads, error } = await getLeads();
  const todayCount = leads.filter((lead) => isToday(lead.created_at)).length;
  const provinceCount = new Set(leads.map((lead) => lead.province).filter(Boolean)).size;
  const consultedCount = leads.filter((lead) => Boolean(lead.note?.trim())).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="/admin" aria-label="Trang quản trị Jinmu">
            <span className={styles.brandMark}>J</span>
            <span><b>JINMU</b><small>TRANG QUẢN TRỊ</small></span>
          </a>
          <div className={styles.headerActions}>
            <a className={styles.refresh} href="/admin"><RefreshCw size={16} /> Làm mới dữ liệu</a>
            <form action="/admin/logout" method="post"><button className={styles.logout} type="submit"><LogOut size={16} /> Đăng xuất</button></form>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>TỔNG QUAN</span>
            <h1>Danh sách đăng ký tư vấn</h1>
            <p>Dữ liệu khách hàng được cập nhật trực tiếp từ biểu mẫu trên trang.</p>
          </div>
          <div className={styles.updated}><span /> Dữ liệu trực tiếp</div>
        </section>

        <section className={styles.stats} aria-label="Thống kê đăng ký">
          <article><div className={styles.icon}><UsersRound /></div><span>Tổng đăng ký</span><strong>{leads.length}</strong><small>Tối đa 1.000 bản ghi mới nhất</small></article>
          <article><div className={styles.icon}><CalendarDays /></div><span>Đăng ký hôm nay</span><strong>{todayCount}</strong><small>Phát sinh trong ngày</small></article>
          <article><div className={styles.icon}><MapPinned /></div><span>Tỉnh/thành</span><strong>{provinceCount}</strong><small>Khu vực có khách quan tâm</small></article>
          <article><div className={styles.icon}><UserRoundCheck /></div><span>Có nhu cầu chi tiết</span><strong>{consultedCount}</strong><small>Đã ghi nội dung tư vấn</small></article>
        </section>

        {error ? <div className={styles.error} role="alert">{error}</div> : <LeadTable leads={leads} />}
      </div>
    </main>
  );
}
