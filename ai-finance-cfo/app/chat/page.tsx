import { chatExamples } from "@/lib/mock-data";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Chat</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">AI 财务对话</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            后续用户可以在这里用自然语言提问。AI 只负责理解问题和组织回复，
            具体金额结果会交给确定性计算函数。
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
                你好，我是你的 AI 个人财务 CFO。你可以问我储蓄目标、现金流、
                债务还款和场景模拟相关问题。
              </div>

              <div className="rounded-lg bg-gray-700 p-4 text-sm text-white">
                我两年内能攒够 50 万吗？
              </div>

              <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
                后续这里会展示 AI 回复、计算结果和可追溯的计算过程。
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">示例问题</h2>
            <div className="mt-4 space-y-3">
              {chatExamples.map((example) => (
                <p
                  key={example}
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600"
                >
                  {example}
                </p>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}