import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "콕콕 출석부",
  description: "모바일 중심의 간편한 배드민턴 모임 출석부"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-black tracking-tight">콕콕 <span className="text-court-600">출석부</span></Link>
          <nav className="flex gap-1 text-sm font-semibold text-slate-600">
            <Link className="rounded-xl px-3 py-2 hover:bg-white" href="/">출석</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white" href="/ranking">랭킹</Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white" href="/admin">관리</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-16">{children}</main>
      </body>
    </html>
  );
}
