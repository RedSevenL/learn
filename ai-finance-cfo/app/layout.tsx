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
  { href: "/scenarios", label: "场景模拟" },
  { href: "/import", label: "CSV 导入" }
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
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-sm font-semibold text-gray-900">
              AI 个人财务 CFO
            </Link>

            <div className="flex items-center gap-4">
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