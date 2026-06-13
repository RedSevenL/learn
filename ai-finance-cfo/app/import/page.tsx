import { importSteps } from "@/lib/mock-data";

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Import</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">CSV 导入</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            后续这里会导入银行、支付宝或微信账单，并转换为统一的流水数据。
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              上传区域占位
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              当前课程只搭建页面骨架，文件选择、CSV 解析和字段映射会在后续课程实现。
            </p>
          </div>

          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">导入流程</h2>
            <ol className="mt-4 space-y-3">
              {importSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-gray-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </div>
    </main>
  );
}