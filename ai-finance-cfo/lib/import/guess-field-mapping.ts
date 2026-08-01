import type { CsvFieldMapping } from "@/lib/import/csv-types";

const FIELD_ALIASES = {
  occurredAt: ["交易日期", "交易时间", "日期", "date", "transaction date"],
  amount: ["金额", "交易金额", "收支金额", "amount"],
  direction: ["收支类型", "收支", "方向", "direction", "type"],
  category: ["分类", "交易分类", "category"],
  merchant: ["交易对象", "商户", "对方", "merchant", "payee"],
  note: ["备注", "说明", "摘要", "note", "description"]
} as const;

function findHeader(headers: string[], aliases: readonly string[]) {
  return headers.find((header) =>
    aliases.includes(header.trim().toLowerCase())
  );
}

export function guessFieldMapping(
  headers: string[]
): Partial<CsvFieldMapping> {
  const normalizedAliases = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([field, aliases]) => [
      field,
      aliases.map((alias) => alias.toLowerCase())
    ])
  ) as Record<keyof CsvFieldMapping, string[]>;

  const mapping: Partial<CsvFieldMapping> = {};

  for (const field of Object.keys(
    normalizedAliases
  ) as Array<keyof CsvFieldMapping>) {
    const header = findHeader(headers, normalizedAliases[field]);

    if (header) {
      mapping[field] = header;
    }
  }

  return mapping;
}