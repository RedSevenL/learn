import { formatMoney } from "@/lib/finance/money";
import type { DashboardMetricResult } from "@/lib/finance/dashboard";
import { MetricCard } from "./MetricCard";

type DashboardMetricsProps = {
  metrics: DashboardMetricResult;
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const cards = [
    {
      label: "净资产",
      value: formatMoney(metrics.netWorth),
      description: "总资产 - 总负债",
    },
    {
      label: "总资产",
      value: formatMoney(metrics.totalAssets),
      description: "现金 + 银行卡 + 投资账户",
    },
    {
      label: "总负债",
      value: formatMoney(metrics.totalLiabilities),
      description: "负债剩余本金",
    },
    {
      label: "月收入",
      value: formatMoney(metrics.monthlyIncome),
      description: "所选月份",
    },
    {
      label: "月支出",
      value: formatMoney(metrics.monthlyExpense),
      description: "所选月份",
    },
    {
      label: "月结余",
      value: formatMoney(metrics.monthlySurplus),
      description: "收入 - 支出",
    },
    {
      label: "储蓄率",
      value:
        metrics.savingsRate === null
          ? "—"
          : `${metrics.savingsRate}%`,
      description: "月结余 ÷ 月收入",
    },
    {
      label: "资产负债率",
      value:
        metrics.debtRatio === null ? "—" : `${metrics.debtRatio}%`,
      description: "总负债 ÷ 总资产",
    },
  ];

  return (
    <section aria-label="核心指标">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );
}