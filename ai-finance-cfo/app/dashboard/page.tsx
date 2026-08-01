"use client";

import { useEffect, useRef, useState } from "react";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { CashFlowTrendChart } from "@/components/dashboard/CashFlowTrendChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { toShanghaiMonth } from "@/lib/finance/cash-flow";
import { dashboardApiResponseSchema } from "@/schemas/dashboard";
import type { DashboardResult } from "@/lib/finance/dashboard";
import type { Account } from "@/types/finance";

// ── 当前月份作为默认基准 ──────────────────────────

function getDefaultMonth(): string {
  return toShanghaiMonth(Date.now());
}

// ── 仪表盘数据获取 ────────────────────────────────

class DashboardFetchError extends Error {
  name = "DashboardFetchError";
}

async function fetchDashboard(
  month: string,
  months: number,
  signal: AbortSignal,
): Promise<DashboardResult> {
  const url = `/api/dashboard?month=${encodeURIComponent(month)}&months=${months}`;
  const response = await fetch(url, { signal });

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new DashboardFetchError("服务器返回了无法读取的响应。");
  }

  const parsed = dashboardApiResponseSchema.safeParse(body);

  if (!parsed.success) {
    throw new DashboardFetchError("服务器返回的数据结构不符合预期。");
  }

  if (!parsed.data.ok) {
    throw new DashboardFetchError(parsed.data.error.message);
  }

  return parsed.data.data;
}

export default function DashboardPage() {
  // ── 账户管理状态 ─────────────────────────────
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountError, setAccountError] = useState("");

  // ── 仪表盘状态 ───────────────────────────────
  const [month, setMonth] = useState(getDefaultMonth);
  const [trendMonths, setTrendMonths] = useState(6);
  const [dashboardResult, setDashboardResult] =
    useState<DashboardResult | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  // ── 加载账户列表 ─────────────────────────────
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      try {
        setIsAccountsLoading(true);

        const response = await fetch("/api/accounts");
        const result: unknown = await response.json();
        const data = result as {
          ok: boolean;
          data?: { accounts: Account[] };
          error?: { message: string };
        };

        if (!cancelled) {
          if (data.ok && data.data) {
            setAccounts(data.data.accounts);
          }
        }
      } catch {
        // 静默
      } finally {
        if (!cancelled) {
          setIsAccountsLoading(false);
        }
      }
    }

    void loadAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── 获取仪表盘数据（支持 AbortController） ───
  useEffect(() => {
    // 取消旧请求
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    async function loadDashboard() {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const result = await fetchDashboard(
          month,
          trendMonths,
          controller.signal,
        );

        if (!controller.signal.aborted && !cancelled) {
          setDashboardResult(result);
        }
      } catch (error) {
        if (controller.signal.aborted || cancelled) {
          return;
        }

        setDashboardError(
          error instanceof DashboardFetchError
            ? error.message
            : "仪表盘数据加载失败，请稍后重试。",
        );
      } finally {
        if (!controller.signal.aborted && !cancelled) {
          setIsDashboardLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [month, trendMonths]);

  // ── 刷新仪表盘（账户操作后调用） ─────────────
  function refreshDashboard() {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsDashboardLoading(true);
    setDashboardError("");

    fetchDashboard(month, trendMonths, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setDashboardResult(result);
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setDashboardError(
          error instanceof DashboardFetchError
            ? error.message
            : "仪表盘数据加载失败，请稍后重试。",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsDashboardLoading(false);
        }
      });
  }

  // ── 提交新建账户 ─────────────────────────────
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccountError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, balance }),
      });

      const result: unknown = await response.json();
      const data = result as {
        ok: boolean;
        data?: { account: Account };
        error?: {
          message: string;
          issues?: Array<{ message: string }>;
        };
      };

      if (!data.ok) {
        const firstIssue = data.error?.issues?.[0];
        setAccountError(
          firstIssue?.message ?? data.error?.message ?? "新增账户失败",
        );
        return;
      }

      const createdAccount = data.data?.account;

      if (createdAccount) {
        setAccounts((current) => [...current, createdAccount]);
      }

      setName("");
      setType("bank");
      setBalance("");

      // 刷新仪表盘
      refreshDashboard();
    } catch {
      setAccountError("新增账户失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── 渲染 ─────────────────────────────────────
  const allLoading = isAccountsLoading && isDashboardLoading;

  if (allLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-gray-500" aria-busy="true">
            正在加载数据...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* 页面标题区 */}
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            财务仪表盘
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            核心指标为当前快照，现金流按所选月份统计。
          </p>
        </header>

        {/* ════ 筛选区 ════ */}
        <section
          aria-label="仪表盘筛选"
          className="mb-6 flex flex-wrap items-end gap-4"
        >
          <label className="text-sm text-gray-700">
            基准月份
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm text-gray-700">
            趋势范围
            <select
              value={trendMonths}
              onChange={(e) => setTrendMonths(Number(e.target.value))}
              className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={3}>3 个月</option>
              <option value={6}>6 个月</option>
              <option value={12}>12 个月</option>
            </select>
          </label>
        </section>

        {/* ════ 仪表盘概览 ════ */}
        <section aria-label="仪表盘概览" className="mb-8">
          {isDashboardLoading && (
            <p className="text-sm text-gray-500" aria-busy="true">
              正在加载仪表盘数据...
            </p>
          )}

          {dashboardError && (
            <div
              role="alert"
              className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{dashboardError}</p>
              <button
                type="button"
                onClick={refreshDashboard}
                className="mt-2 underline hover:no-underline"
              >
                重试
              </button>
            </div>
          )}

          {!isDashboardLoading && !dashboardError && dashboardResult && (
            <div className="space-y-6">
              {/* 全局空状态 */}
              {!dashboardResult.hasFinancialData && (
                <DashboardEmptyState
                  hasAccounts={accounts.length > 0}
                  hasTransactions={false}
                  hasLiabilities={false}
                />
              )}

              {/* 指标卡片 */}
              <DashboardMetrics metrics={dashboardResult.metrics} />

              {/* 现金流趋势图 */}
              <CashFlowTrendChart data={dashboardResult.cashFlowTrend} />

              {/* 分类支出图 */}
              <CategoryExpenseChart
                data={dashboardResult.categoryExpenses}
                baseMonth={month}
              />
            </div>
          )}

          {!isDashboardLoading && !dashboardError && !dashboardResult && (
            <DashboardEmptyState
              hasAccounts={accounts.length > 0}
              hasTransactions={false}
              hasLiabilities={false}
            />
          )}
        </section>

        {/* ════ 账户管理区 ════ */}

        {/* 账户错误提示 */}
        {accountError && (
          <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {accountError}
          </p>
        )}

        {/* 新建账户表单 */}
        <AccountForm
          name={name}
          type={type}
          balance={balance}
          error={accountError}
          isSubmitting={isSubmitting}
          onNameChange={setName}
          onTypeChange={setType}
          onBalanceChange={setBalance}
          onSubmit={handleSubmit}
        />

        {/* 账户列表 */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">账户列表</h2>
            <p className="mt-1 text-sm text-gray-500">
              当前共有 {accounts.length} 个账户。
            </p>
          </div>

          <AccountList accounts={accounts} />
        </section>
      </div>
    </main>
  );
}
