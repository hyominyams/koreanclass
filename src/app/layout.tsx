import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "생각 나누기 보드",
  description:
    "학생은 링크로 바로 글을 쓰고, 교사는 주제별·날짜별로 생각 나누기 결과를 모아보는 웹앱",
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
