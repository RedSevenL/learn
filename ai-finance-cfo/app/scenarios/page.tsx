import Link from "next/link";

export default function ScenariosPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          返回首页
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-sm font-medium text-gray-500">Scenarios</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">场景模拟</h1>
          <p className="mt-2 text-sm text-gray-600">
            模拟收入、支出、储蓄目标变化对未来财务状态的影响。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">买车计划</h2>
            <p className="mt-2 text-sm text-gray-500">
              模拟一次性大额支出对现金流的影响。
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">提前还贷</h2>
            <p className="mt-2 text-sm text-gray-500">
              对比不同还款策略下的利息和现金压力。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}