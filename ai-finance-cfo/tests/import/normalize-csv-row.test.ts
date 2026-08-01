import { describe, expect, it } from "vitest";
import { normalizeCsvRow } from "@/lib/import/normalize-csv-row";
import type { CsvFieldMapping, CsvRawRow } from "@/lib/import/csv-types";

const BASE_MAPPING: CsvFieldMapping = {
  occurredAt: "交易日期",
  amount: "金额",
  direction: "收支类型",
  category: "分类",
  merchant: "交易对象",
  note: "备注"
};

function makeRow(
  overrides: Partial<CsvRawRow> = {}
): CsvRawRow {
  return {
    交易日期: "2026-07-01",
    金额: "-36.50",
    收支类型: "支出",
    交易对象: "早餐店",
    分类: "",
    备注: "早餐",
    ...overrides
  };
}

describe("normalizeCsvRow", () => {
  it("清洗标准支出行", () => {
    const result = normalizeCsvRow({
      row: makeRow(),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.amount).toBe("36.50");
      expect(result.candidate.direction).toBe("expense");
      expect(result.candidate.merchant).toBe("早餐店");
      expect(result.candidate.note).toBe("早餐");
      expect(result.candidate.rawPayload).toBeTruthy();
    }
  });

  it("清洗收入行", () => {
    const result = normalizeCsvRow({
      row: makeRow({
        金额: "20000.00",
        收支类型: "收入",
        交易对象: "某某公司",
        分类: "工资",
        备注: "七月工资"
      }),
      rowNumber: 5,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.amount).toBe("20000.00");
      expect(result.candidate.direction).toBe("income");
      expect(result.candidate.category).toBe("工资");
    }
  });

  it("没有方向列时按符号推断", () => {
    const mappingWithoutDirection: CsvFieldMapping = {
      occurredAt: "交易日期",
      amount: "金额",
      merchant: "交易对象",
      note: "备注"
    };

    const result = normalizeCsvRow({
      row: makeRow(),
      rowNumber: 2,
      mapping: mappingWithoutDirection
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.direction).toBe("expense");
    }
  });

  it("标记错误日期", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 交易日期: "错误日期" }),
      rowNumber: 8,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("invalid");

    if (result.status === "invalid") {
      expect(
        result.issues.some((i) => i.field === "occurredAt")
      ).toBe(true);
    }
  });

  it("标记空金额", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 金额: "abc" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("invalid");

    if (result.status === "invalid") {
      expect(
        result.issues.some((i) => i.field === "amount")
      ).toBe(true);
    }
  });

  it("零金额标记错误", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 金额: "0" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("invalid");
  });

  it("识别 YYYY/MM/DD 格式", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 交易日期: "2026/07/01" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");
  });

  it("拒绝 07/01/2026 格式", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 交易日期: "07/01/2026" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("invalid");
  });

  it("移除金额千分位逗号", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 金额: "20,000.00" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.amount).toBe("20000.00");
    }
  });

  it("移除金额中的货币符号", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 金额: "￥128.00" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.amount).toBe("128.00");
    }
  });

  it("括号表示负数", () => {
    const result = normalizeCsvRow({
      row: makeRow({ 金额: "(88.00)" }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.amount).toBe("88.00");
      expect(result.candidate.direction).toBe("expense");
    }
  });

  it("清洗商户和备注中的空白", () => {
    const result = normalizeCsvRow({
      row: makeRow({
        交易对象: "  早餐店  ",
        备注: "  "
      }),
      rowNumber: 2,
      mapping: BASE_MAPPING
    });

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.candidate.merchant).toBe("早餐店");
      expect(result.candidate.note).toBeUndefined();
    }
  });
});