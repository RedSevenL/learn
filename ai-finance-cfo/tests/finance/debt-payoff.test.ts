import { describe, expect, it } from "vitest";
import {
  compareDebtPayoffStrategies,
  simulateDebtPayoff,
} from "../../lib/finance/debt-payoff";

const debts = [
  {
    id: "study",
    name: "学费借款",
    balance: "10000",
    annualRate: "5",
    minimumPayment: "500",
  },
  {
    id: "card",
    name: "信用卡",
    balance: "30000",
    annualRate: "18",
    minimumPayment: "1000",
  },
  {
    id: "consumer",
    name: "消费贷",
    balance: "20000",
    annualRate: "10",
    minimumPayment: "800",
  },
];

describe("simulateDebtPayoff", () => {
  it("雪球法优先偿还余额较小的债务", () => {
    const result = simulateDebtPayoff({
      debts,
      extraPayment: "1500",
      strategy: "snowball",
    });

    expect(result.priorityOrder).toEqual(["study", "consumer", "card"]);

    expect(result.totalPrincipal).toBe("60000.00");
    expect(result.totalMonthlyBudget).toBe("3800.00");
    expect(result.payoffMonths).toBe(18);
    expect(result.totalInterest).toBe("7304.74");
    expect(result.totalPaid).toBe("67304.74");

    expect(
      result.debts.find((debt) => debt.id === "study")?.paidOffMonth,
    ).toBe(6);
  });

  it("雪崩法优先偿还利率较高的债务", () => {
    const result = simulateDebtPayoff({
      debts,
      extraPayment: "1500",
      strategy: "avalanche",
    });

    expect(result.priorityOrder).toEqual(["card", "consumer", "study"]);

    expect(result.payoffMonths).toBe(18);
    expect(result.totalInterest).toBe("5754.54");
    expect(result.totalPaid).toBe("65754.54");

    expect(
      result.debts.find((debt) => debt.id === "card")?.paidOffMonth,
    ).toBe(14);
  });

  it("零利率债务不会产生利息", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "family",
          name: "亲友借款",
          balance: "1200",
          annualRate: "0",
          minimumPayment: "100",
        },
      ],
      extraPayment: "200",
      strategy: "snowball",
    });

    expect(result.payoffMonths).toBe(4);
    expect(result.totalInterest).toBe("0.00");
    expect(result.totalPaid).toBe("1200.00");
  });

  it("最后一期还款不会超过剩余债务", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "small",
          name: "小额借款",
          balance: "250",
          annualRate: "0",
          minimumPayment: "200",
        },
      ],
      extraPayment: "100",
      strategy: "snowball",
    });

    expect(result.payoffMonths).toBe(1);
    expect(result.totalPaid).toBe("250.00");
  });

  it("两笔债务余额相同时按年利率降序", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "a",
          name: "债务A",
          balance: "10000",
          annualRate: "10",
          minimumPayment: "500",
        },
        {
          id: "b",
          name: "债务B",
          balance: "10000",
          annualRate: "5",
          minimumPayment: "500",
        },
      ],
      extraPayment: "500",
      strategy: "snowball",
    });

    // 余额相同，年利率高的优先
    expect(result.priorityOrder).toEqual(["a", "b"]);
  });

  it("两笔债务利率相同时按余额升序（雪崩法）", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "big",
          name: "大额",
          balance: "30000",
          annualRate: "10",
          minimumPayment: "1000",
        },
        {
          id: "small",
          name: "小额",
          balance: "10000",
          annualRate: "10",
          minimumPayment: "500",
        },
      ],
      extraPayment: "1000",
      strategy: "avalanche",
    });

    // 利率相同，余额小的优先
    expect(result.priorityOrder).toEqual(["small", "big"]);
  });

  it("余额和利率都相同时按 id 字母序兜底", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "zzz",
          name: "债务Z",
          balance: "10000",
          annualRate: "10",
          minimumPayment: "500",
        },
        {
          id: "aaa",
          name: "债务A",
          balance: "10000",
          annualRate: "10",
          minimumPayment: "500",
        },
      ],
      extraPayment: "500",
      strategy: "snowball",
    });

    expect(result.priorityOrder).toEqual(["aaa", "zzz"]);
  });

  it("模拟不会修改原始输入", () => {
    const input = {
      debts,
      extraPayment: "1500",
      strategy: "snowball" as const,
    };

    const before = JSON.stringify(input);

    simulateDebtPayoff(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it("相同输入重复模拟得到相同结果", () => {
    const input = {
      debts,
      extraPayment: "1500",
      strategy: "avalanche" as const,
    };

    const first = simulateDebtPayoff(input);
    const second = simulateDebtPayoff(input);

    expect(second).toEqual(first);
  });

  it("总支付等于初始本金加总利息", () => {
    const result = simulateDebtPayoff({
      debts,
      extraPayment: "1500",
      strategy: "snowball",
    });

    const principal = Number(result.totalPrincipal.replace(".", ""));
    const interest = Number(result.totalInterest.replace(".", ""));
    const paid = Number(result.totalPaid.replace(".", ""));

    expect(principal + interest).toBe(paid);
  });

  it("还清一笔债务后预算滚动到下一笔", () => {
    const result = simulateDebtPayoff({
      debts: [
        {
          id: "first",
          name: "先还清",
          balance: "1000",
          annualRate: "0",
          minimumPayment: "100",
        },
        {
          id: "second",
          name: "后还清",
          balance: "20000",
          annualRate: "0",
          minimumPayment: "200",
        },
      ],
      extraPayment: "3000",
      strategy: "snowball",
    });

    // 月预算 = 100 + 200 + 3000 = 3300
    // 第 1 个月：先还 first 的 100（min），剩余 3200 全还 first → 还清
    // 第 2 个月起剩余预算全部滚到 second
    // second: 20000 - 3300*6 = 20000-19800 = 200, 再加1个月还清
    // 总共约 7 个月
    expect(result.payoffMonths).toBe(7);
    expect(
      result.debts.find((debt) => debt.id === "first")?.paidOffMonth,
    ).toBe(1);
    expect(
      result.debts.find((debt) => debt.id === "second")?.paidOffMonth,
    ).toBe(7);
  });

  it("拒绝空债务数组", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("至少需要一笔债务");
  });

  it("拒绝负的额外还款", () => {
    expect(() =>
      simulateDebtPayoff({
        debts,
        extraPayment: "-1",
        strategy: "avalanche",
      }),
    ).toThrow("额外还款不能为负数");
  });

  it("拒绝为 0 的最低还款", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "card",
            name: "信用卡",
            balance: "10000",
            annualRate: "18",
            minimumPayment: "0",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("最低还款额必须大于 0");
  });

  it("拒绝空债务 id", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "  ",
            name: "空ID",
            balance: "10000",
            annualRate: "18",
            minimumPayment: "1000",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("债务 id 不能为空");
  });

  it("拒绝重复的债务 id", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "dup",
            name: "债务A",
            balance: "10000",
            annualRate: "18",
            minimumPayment: "1000",
          },
          {
            id: "dup",
            name: "债务B",
            balance: "5000",
            annualRate: "10",
            minimumPayment: "500",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("债务 id 重复：dup");
  });

  it("拒绝余额为 0 的债务", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "zero",
            name: "已还清",
            balance: "0",
            annualRate: "5",
            minimumPayment: "100",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("债务余额必须大于 0");
  });

  it("拒绝负利率", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "neg",
            name: "负利率",
            balance: "10000",
            annualRate: "-1",
            minimumPayment: "500",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("年利率必须是非负有限数字");
  });

  it("拒绝非有限数字的利率", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "nan",
            name: "非法利率",
            balance: "10000",
            annualRate: "NaN",
            minimumPayment: "500",
          },
        ],
        extraPayment: "1000",
        strategy: "snowball",
      }),
    ).toThrow("年利率必须是非负有限数字");
  });

  it("预算长期不足时抛出错误", () => {
    expect(() =>
      simulateDebtPayoff({
        debts: [
          {
            id: "high",
            name: "高息借款",
            balance: "100000",
            annualRate: "36",
            minimumPayment: "100",
          },
        ],
        extraPayment: "0",
        strategy: "snowball",
      }),
    ).toThrow("在 1200 个月内无法还清债务");
  });
});

describe("compareDebtPayoffStrategies", () => {
  it("比较两种策略的利息和还清时间", () => {
    const comparison = compareDebtPayoffStrategies({
      debts,
      extraPayment: "1500",
    });

    expect(comparison.interestDifference).toBe("1550.20");
    expect(comparison.monthDifference).toBe(0);

    expect(comparison.avalanche.totalInterest).toBe("5754.54");
  });
});