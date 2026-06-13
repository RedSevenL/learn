import { recentTransactions, summaryCards } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">财务仪表盘</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            汇总展示收入、支出、结余、储蓄率和近期流水。当前使用假数据展示页面结构。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">近期流水</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {transaction.category}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}