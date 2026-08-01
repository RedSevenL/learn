import type { CsvFieldMapping } from "@/lib/import/csv-types";

type CsvFieldMappingFormProps = {
  headers: string[];
  mapping: Partial<CsvFieldMapping>;
  onMappingChange: (mapping: Partial<CsvFieldMapping>) => void;
  onBack: () => void;
  onPreview: () => void;
  disabled: boolean;
};

const FIELD_LABELS: Record<keyof CsvFieldMapping, string> = {
  occurredAt: "交易日期",
  amount: "金额",
  direction: "收支方向",
  category: "分类",
  merchant: "商户",
  note: "备注"
};

const FIELD_REQUIRED: Record<keyof CsvFieldMapping, boolean> = {
  occurredAt: true,
  amount: true,
  direction: false,
  category: false,
  merchant: false,
  note: false
};

export function CsvFieldMappingForm({
  headers,
  mapping,
  onMappingChange,
  onBack,
  onPreview,
  disabled
}: CsvFieldMappingFormProps) {
  function updateField(
    field: keyof CsvFieldMapping,
    header: string
  ) {
    const next = { ...mapping };

    if (header === "") {
      delete next[field];
    } else {
      // 确保同一个 CSV 表头没有被映射到两个内部字段
      for (const key of Object.keys(next) as Array<keyof CsvFieldMapping>) {
        if (next[key] === header && key !== field) {
          delete next[key];
        }
      }

      next[field] = header;
    }

    onMappingChange(next);
  }

  const isOccurredAtMapped = !!mapping.occurredAt;
  const isAmountMapped = !!mapping.amount;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">
        2. 字段映射
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        把 CSV 表头映射到内部字段。日期和金额为必填。
      </p>

      <div className="mt-4 space-y-3">
        {(Object.keys(FIELD_LABELS) as Array<keyof CsvFieldMapping>).map(
          (field) => (
            <div
              key={field}
              className="flex items-center gap-3 sm:gap-4"
            >
              <span className="w-20 shrink-0 text-sm text-gray-700">
                {FIELD_LABELS[field]}
                {FIELD_REQUIRED[field] && (
                  <span className="text-red-500">*</span>
                )}
              </span>

              <select
                value={mapping[field] ?? ""}
                onChange={(e) => updateField(field, e.target.value)}
                disabled={disabled}
                className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-500 disabled:bg-gray-100"
              >
                <option value="">
                  {FIELD_REQUIRED[field]
                    ? "-- 请选择 --"
                    : "-- 不导入此字段 --"}
                </option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          )
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          返回
        </button>

        <button
          type="button"
          onClick={onPreview}
          disabled={
            disabled ||
            !isOccurredAtMapped ||
            !isAmountMapped
          }
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          生成预览
        </button>
      </div>
    </div>
  );
}