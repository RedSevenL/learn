import {
  CalculationSteps,
} from "@/components/goals/CalculationSteps";
import type {
  ChatSuccessData,
} from "@/schemas/chat-response";

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-white p-3">
      <dt className="text-xs text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-gray-900">
        {value}
      </dd>
    </div>
  );
}

export function ChatCalculationCard({
  result,
}: {
  result: ChatSuccessData;
}) {
  const { calculation, assumptions } = result;

  return (
    <section
      aria-label="储蓄目标计算结果"
      className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">
          储蓄目标计算
        </h3>
        <span
          className={
            calculation.reached
              ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
          }
        >
          {calculation.reached
            ? "预计可达成"
            : "预计有缺口"}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <ResultItem
          label="预计期末金额"
          value={`${calculation.projectedAmount} 元`}
        />
        <ResultItem
          label={
            calculation.reached
              ? "预计超额"
              : "目标缺口"
          }
          value={`${
            calculation.reached
              ? calculation.excess
              : calculation.gap
          } 元`}
        />
        <ResultItem
          label="达到目标所需月储蓄"
          value={
            `${calculation.requiredMonthlySaving} 元`
          }
        />
      </dl>

      <div className="mt-4 rounded-md bg-white p-3 text-xs text-gray-600">
        <p>
          数据月份：{assumptions.dataMonth}
        </p>
        <p className="mt-1">
          当前金额口径：现金与银行账户
        </p>
        <p className="mt-1">
          月储蓄口径：当前月收入减支出
        </p>
        <p className="mt-1">
          年化收益率假设：
          {assumptions.annualRate}%
        </p>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-800">
          查看计算过程
        </summary>

        <CalculationSteps
          steps={calculation.steps}
        />
      </details>

      <p className="mt-4 break-all text-xs text-gray-400">
        计算历史 ID：{result.historyId}
      </p>
    </section>
  );
}