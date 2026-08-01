"use client";

import { useEffect, useState } from "react";
import { CalculationSteps } from "@/components/goals/CalculationSteps";
import {
  calculationHistoryApiResponseSchema,
  parseCalculationHistory,
  type ParsedCalculationHistory,
  type ParsedSavingsGoalHistory,
} from "@/schemas/calculation-history";

const moneyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Shanghai",
});

function formatMoney(value: string) {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? moneyFormatter.format(amount)
    : `${value} 元`;
}

function HistoryValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function ValidHistoryCard({
  history,
}: {
  history: ParsedSavingsGoalHistory;
}) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-gray-900">
              储蓄目标计算
            </h2>
            <span
              className={
                history.output.reached
                  ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                  : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
              }
            >
              {history.output.reached
                ? "预计可达成"
                : "预计有缺口"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {dateTimeFormatter.format(history.createdAt)}
          </p>
        </div>
        <span className="break-all text-xs text-gray-500">
          {history.id}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HistoryValue
          label="目标金额"
          value={formatMoney(history.input.targetAmount)}
        />
        <HistoryValue
          label="当前金额"
          value={formatMoney(history.input.currentAmount)}
        />
        <HistoryValue
          label="每月储蓄"
          value={formatMoney(history.input.monthlySaving)}
        />
        <HistoryValue
          label="期限"
          value={`${history.input.months} 个月`}
        />
        <HistoryValue
          label="年化收益率"
          value={`${history.input.annualRate}%`}
        />
        <HistoryValue
          label="预计期末金额"
          value={formatMoney(history.output.projectedAmount)}
        />
        <HistoryValue
          label={history.output.reached ? "预计超额" : "目标缺口"}
          value={formatMoney(
            history.output.reached
              ? history.output.excess
              : history.output.gap,
          )}
        />
        <HistoryValue
          label="达到目标所需月储蓄"
          value={formatMoney(
            history.output.requiredMonthlySaving,
          )}
        />
      </dl>

      <p className="mt-4 text-sm text-gray-600">
        公式版本：{history.formula.version}
        {" · "}
        来源：
        {history.modelTrace
          ? `DeepSeek ${history.modelTrace.model}`
          : "直接计算"}
      </p>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-800">
          查看计算过程
        </summary>
        <CalculationSteps steps={history.formula.steps} />
      </details>
    </article>
  );
}

function InvalidHistoryCard({
  history,
}: {
  history: Extract<
    ParsedCalculationHistory,
    { status: "invalid" }
  >;
}) {
  return (
    <article className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold text-amber-900">
        这条历史暂时无法展示
      </h2>
      <p className="mt-2 text-sm text-amber-800">
        {history.message}
      </p>
      <p className="mt-2 break-all text-xs text-amber-700">
        历史 ID：{history.id}
      </p>
    </article>
  );
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<
    ParsedCalculationHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistories() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/api/calculations/history",
          { signal: controller.signal },
        );
        const body: unknown = await response.json();
        const parsed =
          calculationHistoryApiResponseSchema.safeParse(body);

        if (!parsed.success) {
          throw new Error("历史响应结构不正确");
        }

        if (!response.ok || !parsed.data.ok) {
          throw new Error(
            parsed.data.ok
              ? "历史请求失败"
              : parsed.data.error.message,
          );
        }

        setHistories(
          parsed.data.data.histories.map(
            parseCalculationHistory,
          ),
        );
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError("计算历史加载失败，请稍后重试。");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistories();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Calculation History
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            计算历史
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            从本地数据库回看计算输入、结果、公式版本和可追溯步骤。
          </p>
        </header>

        {isLoading && (
          <p
            className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500"
            aria-busy="true"
            aria-live="polite"
          >
            正在加载计算历史...
          </p>
        )}

        {!isLoading && error && (
          <section
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-5"
          >
            <h2 className="font-semibold text-red-900">
              无法加载计算历史
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </section>
        )}

        {!isLoading && !error && histories.length === 0 && (
          <section className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              还没有计算历史
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              完成一次储蓄目标计算或 AI 财务对话后，
              记录会显示在这里。
            </p>
          </section>
        )}

        {!isLoading && !error && histories.length > 0 && (
          <section
            aria-label="计算历史列表"
            className="space-y-5"
          >
            {histories.map((history) =>
              history.status === "valid" ? (
                <ValidHistoryCard
                  key={history.id}
                  history={history}
                />
              ) : (
                <InvalidHistoryCard
                  key={history.id}
                  history={history}
                />
              ),
            )}
          </section>
        )}
      </div>
    </main>
  );
}
