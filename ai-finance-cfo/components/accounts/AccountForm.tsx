import type { Account } from "@/types/finance";
import { ErrorMessage } from "./ErrorMessage";

type AccountFormProps = {
  name: string;
  type: Account["type"];
  balance: string;
  error: string;
  onNameChange: (value: string) => void;
  onTypeChange: (value: Account["type"]) => void;
  onBalanceChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AccountForm({
  name,
  type,
  balance,
  error,
  onNameChange,
  onTypeChange,
  onBalanceChange,
  onSubmit
}: AccountFormProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
      <p className="mt-1 text-sm text-gray-500">
        当前先用本地状态保存账户数据，后续课程再接入 API 和数据库。
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">账户名称</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="例如：工资卡"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">账户类型</span>
          <select
            value={type}
            onChange={(event) =>
              onTypeChange(event.target.value as Account["type"])
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
            onChange={(event) => onBalanceChange(event.target.value)}
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
  );
}