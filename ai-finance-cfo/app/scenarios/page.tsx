"use client";

import { useState } from "react";
import type { WhatIfResult } from "@/lib/finance/what-if";

function getGoalImpactText(result: WhatIfResult) {
  const impact = result.differences.goalTimingImpact;
  const months = result.differences.goalMonthDifference;

  if (impact === "delayed") {
    return `目标预计推迟 ${months} 个月`;
  }

  if (impact === "accelerated") {
    return `目标预计提前 ${Math.abs(months ?? 0)} 个月`;
  }

  if (impact === "scenario_unreachable") {
    return "变更后 1200 个月内无法达到目标";
  }

  if (impact === "scenario_reachable") {
    return "变更后目标从不可达变为可达";
  }

  if (impact === "both_unreachable") {
    return "两个场景在 1200 个月内都不可达";
  }

  return "目标达成时间不变";
}

function ScenarioComparison({ result }: { result: WhatIfResult }) {
  const impactText = getGoalImpactText(result);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">场景对比</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h3 className="font-semibold text-gray-900">基准场景</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>月结余</dt>
              <dd>{result.baseline.monthlySurplus} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>{result.horizonMonths} 个月后</dt>
              <dd>{result.baseline.projectedNetWorth} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>目标月份</dt>
              <dd>
                {result.baseline.monthsToGoal === null
                  ? "1200 个月内不可达"
                  : `第 ${result.baseline.monthsToGoal} 个月`}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h3 className="font-semibold text-gray-900">变更场景</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>月结余</dt>
              <dd>{result.scenario.monthlySurplus} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>{result.horizonMonths} 个月后</dt>
              <dd>{result.scenario.projectedNetWorth} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>目标月份</dt>
              <dd>
                {result.scenario.monthsToGoal === null
                  ? "1200 个月内不可达"
                  : `第 ${result.scenario.monthsToGoal} 个月`}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">变化影响</h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-900">
          <li>
            月结余差异：{result.differences.monthlySurplus} 元
          </li>
          <li>
            预计净资产差异：{result.differences.projectedNetWorth} 元
          </li>
          <li>{impactText}</li>
        </ul>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        结果基于固定收入、固定支出、名义年化收益率和每月末投入假设，不代表未来收益承诺。
      </p>
    </section>
  );
}

export default function ScenariosPage() {
  const [name, setName] = useState("每月多花 3000 元");
  const [currentAmount, setCurrentAmount] = useState("100000");
  const [targetAmount, setTargetAmount] = useState("500000");
  const [monthlyIncome, setMonthlyIncome] = useState("20000");
  const [monthlyExpense, setMonthlyExpense] = useState("8000");
  const [annualRate, setAnnualRate] = useState("3");
  const [horizonMonths, setHorizonMonths] = useState("24");
  const [monthlyIncomeChange, setMonthlyIncomeChange] = useState("0");
  const [monthlyExpenseChange, setMonthlyExpenseChange] = useState("3000");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: "比较基准与收入、支出变化后的结果",
          baseline: {
            currentAmount,
            targetAmount,
            monthlyIncome,
            monthlyExpense,
            annualRate,
            horizonMonths: Number(horizonMonths),
          },
          changes: {
            monthlyIncomeChange,
            monthlyExpenseChange,
          },
        }),
      });

      const body = await response.json();

      if (!body.ok) {
        const firstIssue = body.error.issues?.[0];
        setError(firstIssue?.message ?? body.error.message);
        return;
      }

      setResult(body.data.calculation);
    } catch {
      setError("场景计算失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Scenarios</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">What-if 场景模拟</h1>
          <p className="mt-2 text-sm text-gray-600">
            保持其他假设不变，比较收入或支出变化对未来资金和目标时间的影响。
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-700">
              场景名称
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              当前目标资金
              <input
                value={currentAmount}
                onChange={(event) => setCurrentAmount(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              目标金额
              <input
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              基准月收入
              <input
                value={monthlyIncome}
                onChange={(event) => setMonthlyIncome(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              基准月支出
              <input
                value={monthlyExpense}
                onChange={(event) => setMonthlyExpense(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              年化收益率（%）
              <input
                value={annualRate}
                onChange={(event) => setAnnualRate(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              观察期限（月）
              <input
                value={horizonMonths}
                onChange={(event) => setHorizonMonths(event.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              月收入变化
              <input
                value={monthlyIncomeChange}
                onChange={(event) => setMonthlyIncomeChange(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              月支出变化
              <input
                value={monthlyExpenseChange}
                onChange={(event) => setMonthlyExpenseChange(event.target.value)}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>
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
            {isSubmitting ? "正在计算..." : "计算并保存场景"}
          </button>
        </form>

        {result && <ScenarioComparison result={result} />}
      </div>
    </main>
  );
}