import type { PreviewedCsvRow } from "@/lib/services/csv-import";

type CsvPreviewTableProps = {
  rows: PreviewedCsvRow[];
  selectedRows: Set<number>;
  onToggleRow: (rowNumber: number) => void;
  onUpdateCategory: (rowNumber: number, category: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  isImporting: boolean;
  isPreviewing: boolean;
};

function formatDate(timestamp: number) {
  const date = new Date(timestamp + 8 * 60 * 60 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function DirectionBadge({ direction }: { direction: string }) {
  const styles: Record<string, string> = {
    income: "bg-green-100 text-green-700",
    expense: "bg-red-100 text-red-700",
    transfer: "bg-blue-100 text-blue-700"
  };

  const labels: Record<string, string> = {
    income: "收入",
    expense: "支出",
    transfer: "转账"
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[direction] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[direction] ?? direction}
    </span>
  );
}

function StatusText({ row }: { row: PreviewedCsvRow }) {
  if (row.duplicate) {
    const reason =
      row.duplicateReason === "same_file"
        ? `与第 ${row.duplicateOfRowNumber} 行疑似重复`
        : "数据库已有疑似重复";

    return (
      <span className="text-xs text-amber-600">
        {reason}
      </span>
    );
  }

  return (
    <span className="text-xs text-green-600">
      可导入
    </span>
  );
}

export function CsvPreviewTable({
  rows,
  selectedRows,
  onToggleRow,
  onUpdateCategory,
  onBack,
  onConfirm,
  isImporting,
  isPreviewing
}: CsvPreviewTableProps) {
  const summary = {
    total: rows.length,
    ready: rows.filter((r) => !r.duplicate).length,
    duplicate: rows.filter((r) => r.duplicate).length,
    selected: selectedRows.size
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">
        3. 预览与确认
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        共 {summary.total} 行，
        可导入 {summary.ready} 行，
        疑似重复 {summary.duplicate} 行，
        已选 {summary.selected} 行。
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th className="px-2 py-2">选择</th>
              <th className="px-2 py-2">行号</th>
              <th className="px-2 py-2">日期</th>
              <th className="px-2 py-2">方向</th>
              <th className="px-2 py-2">金额</th>
              <th className="px-2 py-2">商户</th>
              <th className="px-2 py-2">分类</th>
              <th className="px-2 py-2">备注</th>
              <th className="px-2 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selectedRows.has(row.rowNumber);
              const isDisabled = row.duplicate;

              return (
                <tr
                  key={row.rowNumber}
                  className={`border-b border-gray-100 text-xs ${
                    isSelected ? "bg-gray-50" : ""
                  }`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => onToggleRow(row.rowNumber)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-2 py-2 text-gray-500">
                    {row.rowNumber}
                  </td>
                  <td className="px-2 py-2">
                    {formatDate(row.occurredAt)}
                  </td>
                  <td className="px-2 py-2">
                    <DirectionBadge direction={row.direction} />
                  </td>
                  <td className="px-2 py-2 font-medium">
                    {row.amount}
                  </td>
                  <td className="max-w-[8rem] truncate px-2 py-2 text-gray-600">
                    {row.merchant ?? "-"}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={row.category ?? ""}
                      onChange={(e) =>
                        onUpdateCategory(
                          row.rowNumber,
                          e.target.value
                        )
                      }
                      disabled={isImporting || isDisabled}
                      maxLength={200}
                      className="w-24 rounded border border-gray-200 px-1.5 py-1 text-xs outline-none focus:border-gray-400 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="max-w-[6rem] truncate px-2 py-2 text-gray-500">
                    {row.note ?? "-"}
                  </td>
                  <td className="px-2 py-2">
                    <StatusText row={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isImporting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          返回修改
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={
            isImporting ||
            isPreviewing ||
            selectedRows.size === 0
          }
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isImporting
            ? "正在导入……"
            : `确认导入 ${summary.selected} 条`}
        </button>
      </div>
    </div>
  );
}