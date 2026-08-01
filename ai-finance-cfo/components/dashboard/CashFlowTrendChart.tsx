"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CashFlowTrendPoint } from "@/lib/finance/dashboard";
import {
  formatAxisMoney,
  formatTooltipMoney,
} from "./chart-formatters";

type CashFlowTrendChartProps = {
  data: CashFlowTrendPoint[];
};

type ChartDataPoint = {
  month: string;
  income: number;
  expense: number;
  surplus: number;
};

function toChartData(data: CashFlowTrendPoint[]): ChartDataPoint[] {
  return data.map((point) => ({
    month: point.month,
    income: Number(point.income),
    expense: Number(point.expense),
    surplus: Number(point.surplus),
  }));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-gray-900">{label}</p>

      {payload.map((entry) => (
        <p key={entry.name} className="text-sm text-gray-600">
          {entry.name}：{formatTooltipMoney(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function CashFlowTrendChart({ data }: CashFlowTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8">
        <p className="text-sm text-gray-500">暂无趋势数据</p>
      </div>
    );
  }

  const chartData = toChartData(data);

  return (
    <section aria-label="现金流趋势图">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        现金流趋势
      </h3>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAxisMoney}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  income: "收入",
                  expense: "支出",
                  surplus: "结余",
                };
                return labels[value] ?? value;
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              name="income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              name="expense"
            />
            <Line
              type="monotone"
              dataKey="surplus"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="surplus"
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="mt-2 text-xs text-gray-400">
          收入为绿色，支出为红色，结余为蓝色
        </p>
      </div>
    </section>
  );
}