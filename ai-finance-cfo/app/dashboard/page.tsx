"use client";

import { useState } from "react";
import Link from "next/link";

type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};

const initialAccounts: Account[] = [
  {
    id: "account_001",
    name: "工资卡",
    type: "bank",
    balance: 20000
  },
  {
    id: "account_002",
    name: "现金",
    type: "cash",
    balance: 1000
  },
  {
    id: "account_003",
    name: "信用卡",
    type: "credit",
    balance: -3500
  }
];

function getAccountTypeLabel(type: Account["type"]) {
  if (type === "bank") {
    return "银行卡";
  }

  if (type === "cash") {
    return "现金";
  }

  if (type === "credit") {
    return "信用卡";
  }

  return "投资账户";
}

type AccountCardProps = {
  account: Account;
};

function AccountCard({ account }: AccountCardProps) {
  const balanceClassName =
    account.balance < 0 ? "text-red-600" : "text-gray-900";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            类型：{getAccountTypeLabel(account.type)}
          </p>
        </div>

        <p className={`text-right text-lg font-semibold ${balanceClassName}`}>
          {account.balance.toLocaleString()} 元
        </p>
      </div>
    </div>
  );
}

function EmptyAccounts() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
      <h3 className="text-sm font-semibold text-gray-900">暂无账户</h3>
      <p className="mt-2 text-sm text-gray-500">
        先新增一个账户，用来记录现金、银行卡、信用卡或投资余额。
      </p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

type AccountListProps = {
  accounts: Account[];
};

function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return <EmptyAccounts />;
  }

  return (
    <section className="space-y-3">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
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
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          返回首页
        </Link>
        
        <header className="mt-6 mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">账户管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            新增账户，并查看当前现金、银行卡、信用卡和投资账户。
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
          <p className="mt-1 text-sm text-gray-500">
            先用本地状态保存账户数据，后续课程再接入 API 和数据库。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户名称</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：工资卡"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户类型</span>
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Account["type"])
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                <option value="bank">银行卡</option>
                <option value="cash">现金</option>
                <option value="credit">信用卡</option>
                <option value="investment">投资账户</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户余额</span>
              <input
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder="例如：20000"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </label>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              新增账户
            </button>
          </form>
        </section>

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