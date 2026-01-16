import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AdSenseScript from "@/components/AdSenseScript";

export const metadata: Metadata = {
  title: "블로그 도우미 - Blog Helper Tool",
  description: "블로그 작성을 위한 이미지 크롭, 동영상 변환, 태그 생성 등 다양한 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <AdSenseScript />
      </head>
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </body>
    </html>
  );
}
