import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance CFO",
  description: "Local-first personal finance assistant"
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/chat", label: "对话" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/goals", label: "储蓄目标" },
  { href: "/scenarios", label: "场景模拟" },
  { href: "/import", label: "CSV 导入" },
  { href: "/history", label: "计算历史" },
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="text-sm font-semibold text-gray-900">
              AI 个人财务 CFO
            </Link>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
