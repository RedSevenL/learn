import Link from "next/link";

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          返回首页
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-sm font-medium text-gray-500">Import</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">CSV 导入</h1>
          <p className="mt-2 text-sm text-gray-600">
            后续这里会用于导入银行、支付宝或微信账单。
          </p>
        </header>

        <section className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">导入功能占位</h2>
          <p className="mt-2 text-sm text-gray-500">
            当前课程只搭建页面路径，CSV 解析会在后续课程实现。
          </p>
        </section>
      </div>
    </main>
  );
}