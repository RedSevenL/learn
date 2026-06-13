import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance CFO",
  description: "Local-first personal finance assistant"
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/dashboard", label: "财务面板" },
  { href: "/import", label: "CSV 导入" },
  { href: "/scenarios", label: "场景模拟" }
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
          <nav className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}