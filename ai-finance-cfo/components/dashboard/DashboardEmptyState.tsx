type DashboardEmptyStateProps = {
  hasAccounts: boolean;
  hasTransactions: boolean;
  hasLiabilities: boolean;
  onCreateAccount?: () => void;
};

export function DashboardEmptyState({
  hasAccounts,
  hasTransactions,
  hasLiabilities,
  onCreateAccount,
}: DashboardEmptyStateProps) {
  const allEmpty = !hasAccounts && !hasTransactions && !hasLiabilities;

  if (!allEmpty) {
    return null;
  }

  return (
    <section
      aria-label="无数据提示"
      className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        还没有财务数据
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        先创建一个账户，然后添加流水记录。
      </p>

      {onCreateAccount && (
        <button
          type="button"
          onClick={onCreateAccount}
          className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          创建账户
        </button>
      )}
    </section>
  );
}