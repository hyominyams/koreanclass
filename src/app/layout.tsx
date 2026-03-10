import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "우리 반 생각 보드 | 학급 참여 보드",
  description:
    "질문을 중심으로 생각을 모으고, 하트와 댓글로 서로의 의견을 확장하는 학급 참여 보드입니다.",
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
