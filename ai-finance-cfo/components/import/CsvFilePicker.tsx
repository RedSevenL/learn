type AccountOption = {
  id: string;
  name: string;
};

type CsvFilePickerProps = {
  accounts: AccountOption[];
  accountId: string;
  onAccountChange: (id: string) => void;
  disabled: boolean;
  onFileSelected: (file: File) => void;
};

export function CsvFilePicker({
  accounts,
  accountId,
  onAccountChange,
  disabled,
  onFileSelected
}: CsvFilePickerProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">
        1. 选择账户和文件
      </h2>

      <div className="mt-4">
        <label
          htmlFor="account-select"
          className="text-sm font-medium text-gray-700"
        >
          目标账户
        </label>

        {accounts.length === 0 ? (
          <p className="mt-2 text-sm text-amber-600">
            请先到账户页面创建账户，再导入账单。
          </p>
        ) : (
          <select
            id="account-select"
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            disabled={disabled}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
          >
            <option value="">-- 请选择账户 --</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="csv-file"
          className="text-sm font-medium text-gray-700"
        >
          选择 CSV 文件
        </label>

        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              onFileSelected(file);
            }
          }}
          disabled={disabled || accounts.length === 0}
          className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:cursor-pointer disabled:opacity-50"
        />
      </div>
    </div>
  );
}