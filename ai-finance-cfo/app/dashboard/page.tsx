"use client";//告诉浏览器这是客户端组件

import { useEffect, useState } from "react";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import type { Account } from "@/types/finance";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    async function loadAccounts() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/accounts");
        const result = await response.json();

        if (!result.ok) {
          setError(result.error.message);
          return;
        }

        setAccounts(result.data.accounts);
      } catch {
        setError("账户数据加载失败，请稍后重试。");
      } finally {
        setIsLoading(false);
      }
    }

    loadAccounts();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          type,
          balance
        })
      });

      const result = await response.json();

      if (!result.ok) {
        const firstIssue = result.error.issues?.[0];
        setError(firstIssue?.message ?? result.error.message);
        return;
      }

      setAccounts((currentAccounts) => [
        ...currentAccounts,
        result.data.account
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

  async function handleDeleteAccount(id: string) {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== id)
    );
  }

  async function handleUpdateBalance(id: string, balance: string) {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        balance
      })
    });

    const result = await response.json();

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.id === id ? result.data.account : account
      )
    );
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">正在加载账户数据...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">财务仪表盘</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            先管理现金、银行卡、信用卡和投资账户。
            后续会在这里扩展收入、支出、结余、储蓄率和近期流水。
          </p>
        </header>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

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
