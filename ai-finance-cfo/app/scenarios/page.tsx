import { scenarioCards } from "@/lib/mock-data";

export default function ScenariosPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Scenarios</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">场景模拟</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            用假设条件模拟未来选择的影响。后续会接入确定性计算引擎，
            输出现金流、目标达成率和计算过程。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {scenarioCards.map((scenario) => (
            <div
              key={scenario.title}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-gray-900">{scenario.title}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {scenario.description}
              </p>
              <p className="mt-4 text-xs font-medium text-gray-500">
                待接入计算引擎
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}