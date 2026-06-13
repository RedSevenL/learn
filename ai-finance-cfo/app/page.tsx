import Link from "next/link";
import { featureCards } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            用可追溯的计算辅助个人财务决策
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            AI 负责理解问题和组织表达，财务结果由确定性代码计算。
            当前阶段先搭建页面骨架，后续逐步接入数据和 AI 能力。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {featureCards.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300"
            >
              <p className="text-sm font-medium text-gray-500">
                {feature.kicker}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}