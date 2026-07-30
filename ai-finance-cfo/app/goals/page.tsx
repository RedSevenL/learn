"use client";

import { useState } from "react";
import { CalculationSteps } from "@/components/goals/CalculationSteps";
import type { SavingsGoalResult } from "@/lib/finance/savings-goal";

function GoalInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm text-gray-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="mt-1 w-full rounded-md border border-gray-300 p-2"
      />
    </label>
  );
}

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function GoalSummary({
  result,
  historyId,
}: {
  result: SavingsGoalResult;
  historyId: string;
}) {
  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">计算结果</h2>
        <span className="text-xs text-gray-500">历史 ID：{historyId}</span>
      </div>

      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        <ResultItem label="预计期末金额" value={`${result.projectedAmount} 元`} />
        <ResultItem
          label={result.reached ? "超额" : "目标缺口"}
          value={`${result.reached ? result.excess : result.gap} 元`}
        />
        <ResultItem label="所需月储蓄额" value={`${result.requiredMonthlySaving} 元`} />
      </dl>

      <p className="mt-4 text-sm text-gray-600">
        {result.reached
          ? "按照当前假设可以达到目标。"
          : "按照当前假设尚不能达到目标。"}
      </p>
    </section>
  );
}

export default function GoalsPage() {
  const [targetAmount, setTargetAmount] = useState("500000");
  const [currentAmount, setCurrentAmount] = useState("100000");
  const [monthlySaving, setMonthlySaving] = useState("12000");
  const [annualRate, setAnnualRate] = useState("3");
  const [months, setMonths] = useState("24");
  const [result, setResult] = useState<SavingsGoalResult | null>(null);
  const [historyId, setHistoryId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setHistoryId("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/calculations/savings-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetAmount,
          currentAmount,
          monthlySaving,
          annualRate,
          months: Number(months),
        }),
      });

      const body = await response.json();

      if (!body.ok) {
        const firstIssue = body.error.issues?.[0];
        setError(firstIssue?.message ?? body.error.message);
        return;
      }

      setResult(body.data.calculation);
      setHistoryId(body.data.historyId);
    } catch {
      setError("储蓄目标计算失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Savings Goal</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">储蓄目标计算</h1>
          <p className="mt-2 text-sm text-gray-600">
            计算预计金额，并查看每一步确定性公式。
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <GoalInput label="目标金额" value={targetAmount} onChange={setTargetAmount} />
            <GoalInput label="当前金额" value={currentAmount} onChange={setCurrentAmount} />
            <GoalInput label="每月储蓄" value={monthlySaving} onChange={setMonthlySaving} />
            <GoalInput label="年化收益率（%）" value={annualRate} onChange={setAnnualRate} />
            <GoalInput label="期限（月）" value={months} onChange={setMonths} />
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? "正在计算..." : "计算并保存历史"}
          </button>
        </form>

        {result && (
          <>
            <GoalSummary result={result} historyId={historyId} />
            <CalculationSteps steps={result.steps} />
          </>
        )}
      </div>
    </main>
  );
}