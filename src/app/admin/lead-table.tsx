"use client";

import { useMemo, useState } from "react";
import { Inbox, Search, X } from "lucide-react";
import styles from "./admin.module.css";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  region: string | null;
  birth_year: string | null;
  province: string | null;
  note: string | null;
  program: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function valueOrDash(value: string | null) {
  return value?.trim() || "—";
}

export default function LeadTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");

  const regions = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.region).filter((value): value is string => Boolean(value)))).sort(),
    [leads],
  );
  const filteredLeads = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi");
    return leads.filter((lead) => {
      if (region !== "all" && lead.region !== region) return false;
      if (!keyword) return true;
      return [lead.name, lead.phone, lead.email, lead.province, lead.note, lead.program]
        .some((value) => value?.toLocaleLowerCase("vi").includes(keyword));
    });
  }, [leads, query, region]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div><h2>Thông tin khách hàng</h2><p>Hiển thị {filteredLeads.length} / {leads.length} đăng ký</p></div>
        <div className={styles.filters}>
          <label className={styles.search}>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên, SĐT, tỉnh/thành..." aria-label="Tìm kiếm đăng ký" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm"><X size={15} /></button>}
          </label>
          <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="Lọc theo miền">
            <option value="all">Tất cả miền</option>
            {regions.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className={styles.empty}><Inbox /><h3>Chưa có dữ liệu phù hợp</h3><p>{leads.length ? "Hãy thử từ khóa hoặc bộ lọc khác." : "Đăng ký từ biểu mẫu sẽ xuất hiện tại đây."}</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Thông tin</th><th>Khu vực</th><th>Nhu cầu tư vấn</th><th>Thời gian gửi</th></tr></thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><div className={styles.person}><span>{lead.name.trim().charAt(0).toUpperCase()}</span><div><strong>{lead.name}</strong><small>Mã #{lead.id}</small></div></div></td>
                  <td><a className={styles.phone} href={`tel:${lead.phone}`}>{lead.phone}</a><small>{valueOrDash(lead.email)}</small></td>
                  <td><span>{valueOrDash(lead.gender)}</span><small>Năm sinh: {valueOrDash(lead.birth_year)}</small></td>
                  <td><span>{valueOrDash(lead.province)}</span><small>Miền: {valueOrDash(lead.region)}</small></td>
                  <td className={styles.need}><span>{valueOrDash(lead.program)}</span><small title={lead.note ?? ""}>{valueOrDash(lead.note)}</small></td>
                  <td className={styles.date}>{formatDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
