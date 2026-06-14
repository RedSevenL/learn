import type { Account } from "@/types/finance";
import { AccountCard } from "./AccountCard";
import { EmptyAccounts } from "./EmptyAccounts";

type AccountListProps = {
  accounts: Account[];
};

export function AccountList({ accounts }: AccountListProps) {
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