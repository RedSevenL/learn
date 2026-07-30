"use client"; // 标记为客户端组件，可以使用浏览器 API 和 React 状态

import { useEffect, useState } from "react";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import type { Account } from "@/types/finance";
import { CashFlowSummary } from "@/components/dashboard/CashFlowSummary";
import type { MonthlyCashFlowResult } from "@/lib/finance/cash-flow";

// 仪表盘主页：账户管理 + 现金流概览
export default function DashboardPage() {
  // 表单状态：新建账户的表单字段
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");

  // 数据状态：账户列表、现金流、加载与提交标记
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashFlow, setCashFlow] = useState<MonthlyCashFlowResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 页面加载时并发获取账户和现金流数据
  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const [accountsResponse, cashFlowResponse] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/cash-flow"),
        ]);

        const [accountsResult, cashFlowResult] = await Promise.all([
          accountsResponse.json(),
          cashFlowResponse.json(),
        ]);

        if (!accountsResult.ok) {
          setError(accountsResult.error.message);
          return;
        }

        if (!cashFlowResult.ok) {
          setError(cashFlowResult.error.message);
          return;
        }

        setAccounts(accountsResult.data.accounts);
        setCashFlow(cashFlowResult.data.cashFlow);
      } catch {
        setError("仪表盘数据加载失败，请稍后重试。");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // 提交新建账户表单
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          balance,
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        const firstIssue = result.error.issues?.[0];
        setError(firstIssue?.message ?? result.error.message);
        return;
      }

      // 成功后追加新账户到列表，并重置表单
      setAccounts((currentAccounts) => [
        ...currentAccounts,
        result.data.account,
      ]);

      setName("");
      setType("bank");
      setBalance("");
    } catch {
      setError("新增账户失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 删除指定账户
  async function handleDeleteAccount(id: string) {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== id),
    );
  }

  // 更新指定账户余额
  async function handleUpdateBalance(id: string, balance: string) {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        balance,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === id ? result.data.account : account,
      ),
    );
  }

  // 加载中展示简单提示
  if (isLoading) {
    return <p className="text-sm text-gray-500">正在加载账户数据...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* 页面标题区 */}
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">财务仪表盘</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            先管理现金、银行卡、信用卡和投资账户。
            后续会在这里扩展收入、支出、结余、储蓄率和近期流水。
          </p>
        </header>

        {/* 全局错误提示 */}
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* 现金流概览卡片 */}
        {cashFlow && (
          <div className="mb-8">
            <CashFlowSummary cashFlow={cashFlow} />
          </div>
        )}

        {/* 新建账户表单 */}
        <AccountForm
          name={name}
          type={type}
          balance={balance}
          error={error}
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
