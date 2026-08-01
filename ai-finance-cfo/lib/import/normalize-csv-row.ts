import { inferCategory } from "@/lib/import/infer-category";
import type {
  CsvDraftRow,
  CsvFieldMapping,
  CsvRawRow
} from "@/lib/import/csv-types";

// ── 帮助函数 ──────────────────────────────────────

function optionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

// ── 日期清洗 ──────────────────────────────────────

function parseShanghaiDate(value: string) {
  const normalized = value.trim().replaceAll("/", "-");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error("日期必须是 YYYY-MM-DD 或 YYYY/MM/DD");
  }

  const timestamp = Date.parse(`${normalized}T00:00:00+08:00`);

  if (!Number.isFinite(timestamp)) {
    throw new Error("日期无效");
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const shanghaiDate = new Date(timestamp + 8 * 60 * 60 * 1000);

  if (
    shanghaiDate.getUTCFullYear() !== year ||
    shanghaiDate.getUTCMonth() + 1 !== month ||
    shanghaiDate.getUTCDate() !== day
  ) {
    throw new Error(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 不是有效日期`
    );
  }

  return timestamp;
}

// ── 金额清洗 ──────────────────────────────────────

import Decimal from "decimal.js";

type ParsedAmount = {
  absoluteAmount: string;
  sign: "positive" | "negative" | "zero";
};

function parseAmount(value: string): ParsedAmount {
  const trimmed = value.trim();
  const isParenthesized =
    trimmed.startsWith("(") && trimmed.endsWith(")");

  const cleaned = trimmed
    .replaceAll(",", "")
    .replace(/[¥￥元\s]/g, "")
    .replace(/^\((.*)\)$/, "-$1");

  if (!/^[+-]?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("金额格式不正确");
  }

  const decimal = new Decimal(cleaned);

  if (decimal.isZero()) {
    throw new Error("金额不能为 0");
  }

  const negative = isParenthesized || decimal.isNegative();

  return {
    absoluteAmount: decimal.abs().toFixed(2),
    sign: negative ? "negative" : "positive"
  };
}

// ── 方向清洗 ──────────────────────────────────────

const DIRECTION_ALIASES = {
  income: ["收入", "入账", "income", "credit"],
  expense: ["支出", "出账", "expense", "debit"],
  transfer: ["转账", "内部转账", "transfer"]
} as const;

function parseDirection(
  value: string | undefined,
  amountSign: "positive" | "negative" | "zero"
) {
  const normalized = value?.trim().toLowerCase();

  if (normalized) {
    for (const [direction, aliases] of Object.entries(
      DIRECTION_ALIASES
    )) {
      if ((aliases as readonly string[]).includes(normalized)) {
        return direction as "income" | "expense" | "transfer";
      }
    }

    throw new Error(`无法识别收支方向：${value}`);
  }

  return amountSign === "negative" ? "expense" : "income";
}

// ── 读取映射值 ────────────────────────────────────

function readMappedValue(
  row: CsvRawRow,
  header: string | undefined
) {
  return header ? row[header] : undefined;
}

// ── 主函数 ────────────────────────────────────────

export function normalizeCsvRow(input: {
  row: CsvRawRow;
  rowNumber: number;
  mapping: CsvFieldMapping;
}): CsvDraftRow {
  const { row, rowNumber, mapping } = input;
  const issues: Array<{
    field: keyof CsvFieldMapping | "row";
    message: string;
  }> = [];

  let occurredAt: number | undefined;
  let amount:
    | {
        absoluteAmount: string;
        sign: "positive" | "negative" | "zero";
      }
    | undefined;

  try {
    occurredAt = parseShanghaiDate(
      readMappedValue(row, mapping.occurredAt) ?? ""
    );
  } catch (error) {
    issues.push({
      field: "occurredAt",
      message:
        error instanceof Error ? error.message : "日期格式不正确"
    });
  }

  try {
    amount = parseAmount(
      readMappedValue(row, mapping.amount) ?? ""
    );
  } catch (error) {
    issues.push({
      field: "amount",
      message:
        error instanceof Error ? error.message : "金额格式不正确"
    });
  }

  let direction: "income" | "expense" | "transfer" | undefined;

  if (amount) {
    try {
      direction = parseDirection(
        readMappedValue(row, mapping.direction),
        amount.sign
      );
    } catch (error) {
      issues.push({
        field: "direction",
        message:
          error instanceof Error ? error.message : "收支方向不正确"
      });
    }
  }

  if (
    issues.length > 0 ||
    occurredAt === undefined ||
    amount === undefined ||
    direction === undefined
  ) {
    return {
      status: "invalid",
      rowNumber,
      raw: row,
      issues
    };
  }

  const merchant = optionalText(
    readMappedValue(row, mapping.merchant)
  );
  const note = optionalText(readMappedValue(row, mapping.note));
  const originalCategory = optionalText(
    readMappedValue(row, mapping.category)
  );
  const categoryResult = inferCategory({
    category: originalCategory,
    merchant,
    note
  });

  return {
    status: "valid",
    candidate: {
      rowNumber,
      occurredAt,
      amount: amount.absoluteAmount,
      direction,
      category: categoryResult.category,
      merchant,
      note,
      rawPayload: JSON.stringify(row)
    }
  };
}