import { formatMoney } from "@/lib/finance/money";
import type {
  MonthlyCashFlowResult
} from "@/lib/finance/cash-flow";

type CashFlowSummaryProps = {
  cashFlow: MonthlyCashFlowResult;
};

export function CashFlowSummary({
  cashFlow
}: CashFlowSummaryProps) {
  if (!cashFlow.hasCashFlow) {
    return (
      <section className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          本月现金流
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          本月还没有收入或支出流水，新增流水后会在这里显示汇总。
        </p>
      </section>
    );
  }

  const metrics = [
    {
      label: "月收入",
      value: formatMoney(cashFlow.income)
    },
    {
      label: "月支出",
      value: formatMoney(cashFlow.totalExpense)
    },
    {
      label: "月结余",
      value: formatMoney(cashFlow.surplus)
    },
    {
      label: "储蓄率",
      value: cashFlow.savingsRate === null
        ? "—"
        : `${cashFlow.savingsRate}%`
    },
    {
      label: "安全现金月数",
      value: cashFlow.safeCashMonths === null
        ? "—"
        : `${cashFlow.safeCashMonths} 个月`
    }
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          本月现金流
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          统计月份：{cashFlow.month}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        固定支出 {formatMoney(cashFlow.fixedExpense)}
        {" · "}
        可变支出 {formatMoney(cashFlow.variableExpense)}
      </p>
    </section>
  );
}