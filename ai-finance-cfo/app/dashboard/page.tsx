"use client";

import { useState } from "react";
import { AccountForm } from "@/components/accounts/AccountForm";
import { AccountList } from "@/components/accounts/AccountList";
import { initialAccounts } from "@/lib/mock-data";
import type { Account } from "@/types/finance";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const numericBalance = Number(balance);

    if (trimmedName.length === 0) {
      setError("请输入账户名称。");
      return;
    }

    if (!Number.isFinite(numericBalance)) {
      setError("请输入合法的账户余额。");
      return;
    }

    const newAccount: Account = {
      id: `account_${Date.now()}`,
      name: trimmedName,
      type,
      balance: numericBalance
    };

    setAccounts([...accounts, newAccount]);
    setName("");
    setType("bank");
    setBalance("");
    setError("");
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

        <AccountForm
          name={name}
          type={type}
          balance={balance}
          error={error}
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