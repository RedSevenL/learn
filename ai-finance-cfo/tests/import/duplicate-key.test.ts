import { describe, expect, it } from "vitest";
import { buildTransactionDuplicateKey } from "@/lib/import/duplicate-key";

describe("buildTransactionDuplicateKey", () => {
  it("金额 199 与 199.00 得到同一个键", () => {
    const key1 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "199",
      direction: "expense",
      merchant: "中国移动"
    });

    const key2 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "199.00",
      direction: "expense",
      merchant: "中国移动"
    });

    expect(key1).toBe(key2);
  });

  it("商户首尾空格不影响键", () => {
    const key1 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense",
      merchant: "早餐店"
    });

    const key2 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense",
      merchant: "  早餐店  "
    });

    expect(key1).toBe(key2);
  });

  it("商户英文大小写不影响键", () => {
    const key1 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense",
      merchant: "Starbucks"
    });

    const key2 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense",
      merchant: "starbucks"
    });

    expect(key1).toBe(key2);
  });

  it("不同账户得到不同键", () => {
    const key1 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "100",
      direction: "income",
      merchant: "公司"
    });

    const key2 = buildTransactionDuplicateKey({
      accountId: "a2",
      occurredAt: 1000,
      amount: "100",
      direction: "income",
      merchant: "公司"
    });

    expect(key1).not.toBe(key2);
  });

  it("不同方向得到不同键", () => {
    const key1 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "100",
      direction: "income",
      merchant: "公司"
    });

    const key2 = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "100",
      direction: "expense",
      merchant: "公司"
    });

    expect(key1).not.toBe(key2);
  });

  it("商户为 null 不影响键", () => {
    const key = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense",
      merchant: null
    });

    expect(key).toContain("|");
  });

  it("商户为 undefined 不影响键", () => {
    const key = buildTransactionDuplicateKey({
      accountId: "a1",
      occurredAt: 1000,
      amount: "50",
      direction: "expense"
    });

    expect(key).toContain("|");
  });
});