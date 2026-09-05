import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jinmu | Cơ hội nghề nghiệp tại Singapore",
  description: "Tư vấn lộ trình đi Singapore minh bạch, đồng hành cùng bạn từ hồ sơ đến ngày xuất cảnh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
