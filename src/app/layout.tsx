import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "생각 정리 보드",
  description:
    "학생은 익명으로 생각을 정리해 제출하고, 교사는 별도 대시보드에서 주제와 응답을 관리하는 수업용 보드입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
