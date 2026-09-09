import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Đăng nhập quản trị | Jinmu", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginVisual}>
        <div className={styles.loginBrand}><span>J</span><b>JINMU</b></div>
        <div className={styles.loginMessage}>
          <span>HỆ THỐNG QUẢN TRỊ</span><h1>Quản lý khách hàng<br />tập trung, bảo mật.</h1>
          <p>Theo dõi toàn bộ đăng ký tư vấn được gửi từ website Jinmu.</p>
          <div><ShieldCheck /> Dữ liệu chỉ dành cho người quản trị được cấp quyền.</div>
        </div>
      </section>
      <section className={styles.loginPanel}>
        <div className={styles.loginBox}>
          <div className={styles.mobileBrand}><span>J</span><b>JINMU</b></div>
          <span className={styles.loginKicker}>CHÀO MỪNG TRỞ LẠI</span><h2>Đăng nhập quản trị</h2>
          <p>Nhập thông tin tài khoản để truy cập danh sách đăng ký.</p>
          {error && <div className={styles.loginError} role="alert">{error === "config" ? "Tài khoản quản trị chưa được cấu hình." : "Tên đăng nhập hoặc mật khẩu không đúng."}</div>}
          <form className={styles.loginForm} action="/admin/auth" method="post">
            <label><span>Tên đăng nhập</span><div><UserRound /><input required name="username" autoComplete="username" placeholder="Nhập tên đăng nhập" autoFocus /></div></label>
            <label><span>Mật khẩu</span><div><LockKeyhole /><input required name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" /></div></label>
            <button type="submit">Đăng nhập</button>
          </form>
          <small className={styles.loginNote}><ShieldCheck /> Phiên đăng nhập sẽ tự hết hạn sau 8 giờ.</small>
        </div>
      </section>
    </main>
  );
}
