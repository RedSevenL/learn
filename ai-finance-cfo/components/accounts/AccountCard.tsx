import type { Account } from "@/types/finance";

type AccountCardProps = {
  account: Account;
};

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

export function AccountCard({ account }: AccountCardProps) {
  const balanceClassName =
   Number(account.balance)  ? "text-red-600" : "text-gray-900";

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
         {Number(account.balance).toLocaleString()} 元
        </p>
      </div>
    </div>
  );
}