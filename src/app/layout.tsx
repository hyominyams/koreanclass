import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "우리반 생각보드",
  description:
    "주제를 고르고, 친구들의 생각을 읽고, 하트와 댓글로 반응하는 학급용 생각보드입니다.",
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
