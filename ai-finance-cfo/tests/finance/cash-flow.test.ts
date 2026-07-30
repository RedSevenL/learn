import { describe, expect, it } from "vitest";
import {
  calculateMonthlyCashFlow,
  toShanghaiMonth,
} from "../../lib/finance/cash-flow";

const julyTimestamp = Date.UTC(2026, 6, 15, 4);

describe("calculateMonthlyCashFlow", () => {
  it("汇总月收入、固定支出和可变支出", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [
        {
          amount: "10000",
          direction: "income",
          category: "工资",
          occurredAt: julyTimestamp,
        },
        {
          amount: "3000",
          direction: "expense",
          category: "居住",
          occurredAt: julyTimestamp,
        },
        {
          amount: "2000",
          direction: "expense",
          category: "餐饮",
          occurredAt: julyTimestamp,
        },
      ],
      accounts: [
        { type: "cash", balance: "5000" },
        { type: "bank", balance: "25000" },
        { type: "investment", balance: "50000" },
      ],
    });

    expect(result).toEqual({
      month: "2026-07",
      hasCashFlow: true,
      income: "10000.00",
      fixedExpense: "3000.00",
      variableExpense: "2000.00",
      totalExpense: "5000.00",
      surplus: "5000.00",
      savingsRate: "50.00",
      liquidAssets: "30000.00",
      safeCashMonths: "6.0",
    });
  });

  it("忽略账户之间的转账", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [
        {
          amount: "5000",
          direction: "transfer",
          category: null,
          occurredAt: julyTimestamp,
        },
      ],
      accounts: [],
    });

    expect(result.hasCashFlow).toBe(false);
    expect(result.income).toBe("0.00");
    expect(result.totalExpense).toBe("0.00");
  });

  it("没有流水时返回零值和不可计算状态", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [],
      accounts: [],
    });

    expect(result.hasCashFlow).toBe(false);
    expect(result.income).toBe("0.00");
    expect(result.totalExpense).toBe("0.00");
    expect(result.surplus).toBe("0.00");
    expect(result.savingsRate).toBeNull();
    expect(result.safeCashMonths).toBeNull();
  });

  it("只汇总指定月份的流水", () => {
    const augustTimestamp = Date.UTC(2026, 7, 15, 4);

    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [
        {
          amount: "10000",
          direction: "income",
          category: "工资",
          occurredAt: julyTimestamp,
        },
        {
          amount: "99999",
          direction: "income",
          category: "工资",
          occurredAt: augustTimestamp,
        },
      ],
      accounts: [],
    });

    expect(result.income).toBe("10000.00");
  });

  it("支出高于收入时返回负结余和负储蓄率", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [
        {
          amount: "3000",
          direction: "income",
          category: "工资",
          occurredAt: julyTimestamp,
        },
        {
          amount: "4500",
          direction: "expense",
          category: "餐饮",
          occurredAt: julyTimestamp,
        },
      ],
      accounts: [],
    });

    expect(result.surplus).toBe("-1500.00");
    expect(result.savingsRate).toBe("-50.00");
  });

  it("收入为 0 时储蓄率不可计算", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [
        {
          amount: "1000",
          direction: "expense",
          category: "餐饮",
          occurredAt: julyTimestamp,
        },
      ],
      accounts: [],
    });

    expect(result.savingsRate).toBeNull();
  });

  it("拒绝负流水金额", () => {
    expect(() =>
      calculateMonthlyCashFlow({
        month: "2026-07",
        transactions: [
          {
            amount: "-100",
            direction: "expense",
            category: "餐饮",
            occurredAt: julyTimestamp,
          },
        ],
        accounts: [],
      }),
    ).toThrow("流水金额不能为负数");
  });

  it("按照上海时区判断月份边界", () => {
    const beforeJuly = Date.UTC(2026, 5, 30, 15, 59, 59, 999);
    const julyInShanghai = Date.UTC(2026, 5, 30, 16, 0, 0, 0);

    expect(toShanghaiMonth(beforeJuly)).toBe("2026-06");
    expect(toShanghaiMonth(julyInShanghai)).toBe("2026-07");
  });

  it.each(["2026-7", "2026-00", "2026-13", "July"])(
    "拒绝非法月份 %s",
    (month) => {
      expect(() =>
        calculateMonthlyCashFlow({
          month,
          transactions: [],
          accounts: [],
        }),
      ).toThrow("月份格式必须是 YYYY-MM");
    },
  );

  it("拒绝未知流水方向", () => {
    expect(() =>
      calculateMonthlyCashFlow({
        month: "2026-07",
        transactions: [
          {
            amount: "100",
            direction: "refund",
            category: null,
            occurredAt: julyTimestamp,
          },
        ],
        accounts: [],
      }),
    ).toThrow("未知流水方向：refund");
  });

  it("支出为 0 时安全现金月数不可计算", () => {
    const result = calculateMonthlyCashFlow({
      month: "2026-07",
      transactions: [],
      accounts: [{ type: "bank", balance: "10000" }],
    });

    expect(result.safeCashMonths).toBeNull();
  });

  it.each(["0", "-1000"])(
    "流动资产为 %s 时安全现金月数为 0",
    (balance) => {
      const result = calculateMonthlyCashFlow({
        month: "2026-07",
        transactions: [
          {
            amount: "1000",
            direction: "expense",
            category: "餐饮",
            occurredAt: julyTimestamp,
          },
        ],
        accounts: [{ type: "bank", balance }],
      });

      expect(result.safeCashMonths).toBe("0.0");
    },
  );
});