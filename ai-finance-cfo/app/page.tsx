import Link from "next/link";

const links = [
  {
    href: "/dashboard",
    title: "财务面板",
    description: "查看账户、流水、负债和月度摘要。"
  },
  {
    href: "/import",
    title: "CSV 导入",
    description: "后续用于导入银行、支付宝或微信账单。"
  },
  {
    href: "/scenarios",
    title: "场景模拟",
    description: "模拟收入、支出、储蓄目标变化带来的影响。"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            本地优先的个人财务助手
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            从账户、流水和场景模拟开始，逐步构建可追溯的财务决策工具。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300"
            >
              <h2 className="font-semibold text-gray-900">{link.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}