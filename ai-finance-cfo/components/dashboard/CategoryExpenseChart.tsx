"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategoryExpensePoint } from "@/lib/finance/dashboard";
import {
  formatAxisMoney,
  formatTooltipMoney,
  formatTooltipPercent,
} from "./chart-formatters";

type CategoryExpenseChartProps = {
  data: CategoryExpensePoint[];
  baseMonth: string;
};

type ChartDataPoint = {
  category: string;
  amount: number;
  share: string;
};

function toChartData(data: CategoryExpensePoint[]): ChartDataPoint[] {
  return data.map((point) => ({
    category: point.category,
    amount: Number(point.amount),
    share: point.share,
  }));
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-gray-900">{data.category}</p>
      <p className="text-sm text-gray-600">
        金额：{formatTooltipMoney(data.amount)}
      </p>
      <p className="text-sm text-gray-600">
        占比：{formatTooltipPercent(Number(data.share))}
      </p>
    </div>
  );
}

export function CategoryExpenseChart({
  data,
  baseMonth,
}: CategoryExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8">
        <p className="text-sm text-gray-500">
          {baseMonth} 月份没有支出数据
        </p>
      </div>
    );
  }

  const chartData = toChartData(data);

  return (
    <section aria-label="分类支出图">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        分类支出（{baseMonth}）
      </h3>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 80, right: 20, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={formatAxisMoney}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amount"
              fill="#2563eb"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
