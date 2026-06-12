"use client";

import { useState } from "react";

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

type AccountCardProps = {
  account: Account;
};

function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{account.name}</h2>
      <p>类型：{account.type}</p>
      <p>余额：{account.balance} 元</p>
    </div>
  );
}

type AccountListProps = {
  accounts: Account[];
};

function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <p className="mt-6 rounded border border-dashed p-4 text-gray-600">
        暂无账户，请先新增一个账户。
      </p>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}

export default function Home() {
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
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">账户管理</h1>
      <p className="mt-2 text-gray-600">
        新增账户，并在页面中查看当前账户列表。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="block font-medium">账户名称</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：工资卡"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="block font-medium">账户类型</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as Account["type"])}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="bank">银行卡</option>
            <option value="cash">现金</option>
            <option value="credit">信用卡</option>
            <option value="investment">投资账户</option>
          </select>
        </label>

        <label className="block">
          <span className="block font-medium">账户余额</span>
          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="例如：20000"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          新增账户
        </button>
      </form>

      <AccountList accounts={accounts} />
    </main>
  );
}