type CsvImportSummaryProps = {
  imported: number;
  skipped: number;
  onReset: () => void;
};

export function CsvImportSummary({
  imported,
  skipped,
  onReset
}: CsvImportSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">
        导入完成
      </h2>

      <div className="mt-4 space-y-2 text-sm">
        <p>
          成功写入：
          <span className="font-semibold text-green-700">
            {imported} 条
          </span>
        </p>

        {skipped > 0 && (
          <p>
            跳过（疑似重复）：
            <span className="font-semibold text-amber-700">
              {skipped} 条
            </span>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        继续导入另一个文件
      </button>
    </div>
  );
}