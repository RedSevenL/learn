import { describe, expect, it } from "vitest";
import {
  calculateDashboard,
  listRecentMonths,
} from "../../lib/finance/dashboard";
import type { DashboardInput } from "../../lib/finance/dashboard";

// ── listRecentMonths ──────────────────────────────

describe("listRecentMonths", () => {
  it("返回最近 N 个月（含基准月）", () => {
    expect(listRecentMonths("2026-07", 3)).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
  });

  it("跨年正确", () => {
    expect(listRecentMonths("2026-01", 3)).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
    ]);
  });

  it("单月", () => {
    expect(listRecentMonths("2026-07", 1)).toEqual(["2026-07"]);
  });

  it("12 个月", () => {
    const result = listRecentMonths("2026-07", 12);
    expect(result).toHaveLength(12);
    expect(result[0]).toBe("2025-08");
    expect(result[11]).toBe("2026-07");
  });

  it("月份格式不合法时抛出错误", () => {
    expect(() => listRecentMonths("2026-13", 3)).toThrow(
      "月份格式必须是 YYYY-MM",
    );
    expect(() => listRecentMonths("2026/07", 3)).toThrow(
      "月份格式必须是 YYYY-MM",
    );
    expect(() => listRecentMonths("abc", 3)).toThrow(
      "月份格式必须是 YYYY-MM",
    );
  });

  it("count 不合法时抛出错误", () => {
    expect(() => listRecentMonths("2026-07", 0)).toThrow(
      "月份数量必须是正整数",
    );
    expect(() => listRecentMonths("2026-07", -1)).toThrow(
      "月份数量必须是正整数",
    );
    expect(() => listRecentMonths("2026-07", 3.5)).toThrow(
      "月份数量必须是正整数",
    );
  });
});

// ── 基础测试数据 ───────────────────────────────────

const BASE_INPUT: DashboardInput = {
  baseMonth: "2026-07",
  trendMonths: 3,
  accounts: [
    { type: "bank", currency: "CNY", balance: "50000" },
    { type: "cash", currency: "CNY", balance: "10000" },
    { type: "investment", currency: "CNY", balance: "100000" },
    { type: "credit", currency: "CNY", balance: "-3000" }, // 信用卡不计入
  ],
  liabilities: [{ remainingPrincipal: "80000" }],
  transactions: [
    // 2026-07 收入
    { amount: "30000", direction: "income", category: "工资", occurredAt: 1784088000000 },
    // 2026-07 支出
    { amount: "6000", direction: "expense", category: "居住", occurredAt: 1784088000000 },
    { amount: "1200", direction: "expense", category: "餐饮", occurredAt: 1784088000000 },
    { amount: "500", direction: "expense", category: "交通", occurredAt: 1784088000000 },
    // 2026-06 支出
    { amount: "5500", direction: "expense", category: "居住", occurredAt: 1781496000000 },
    { amount: "1000", direction: "expense", category: "餐饮", occurredAt: 1781496000000 },
    // 2026-05 支出
    { amount: "5500", direction: "expense", category: "居住", occurredAt: 1778817600000 },
    // 转账（不计入收支）
    { amount: "5000", direction: "transfer", category: "转账", occurredAt: 1784088000000 },
  ],
};

// ── calculateDashboard ────────────────────────────

describe("calculateDashboard", () => {
  it("计算完整的仪表盘结果", () => {
    const result = calculateDashboard(BASE_INPUT);

    // 元数据
    expect(result.baseMonth).toBe("2026-07");
    expect(result.trendMonths).toBe(3);
    expect(result.hasFinancialData).toBe(true);

    // 指标：总资产 = 50000 + 10000 + 100000 = 160000
    expect(result.metrics.totalAssets).toBe("160000.00");
    // 总负债 = 80000
    expect(result.metrics.totalLiabilities).toBe("80000.00");
    // 净资产 = 160000 - 80000 = 80000
    expect(result.metrics.netWorth).toBe("80000.00");

    // 月收入 = 30000
    expect(result.metrics.monthlyIncome).toBe("30000.00");
    // 月支出 = 6000 + 1200 + 500 = 7700
    expect(result.metrics.monthlyExpense).toBe("7700.00");
    // 月结余 = 30000 - 7700 = 22300
    expect(result.metrics.monthlySurplus).toBe("22300.00");

    // 储蓄率 = 22300 / 30000 * 100 = 74.33
    expect(result.metrics.savingsRate).toBe("74.33");

    // 资产负债率 = 80000 / 160000 * 100 = 50.00
    expect(result.metrics.debtRatio).toBe("50.00");
  });

  it("趋势数据包含 3 个月", () => {
    const result = calculateDashboard(BASE_INPUT);

    expect(result.cashFlowTrend).toHaveLength(3);
    expect(result.cashFlowTrend[0].month).toBe("2026-05");
    expect(result.cashFlowTrend[1].month).toBe("2026-06");
    expect(result.cashFlowTrend[2].month).toBe("2026-07");
  });

  it("分类支出聚合正确", () => {
    const result = calculateDashboard(BASE_INPUT);

    // 2026-07 支出：居住 6000、餐饮 1200、交通 500
    expect(result.categoryExpenses).toHaveLength(3);

    const housing = result.categoryExpenses.find((c) => c.category === "居住");
    expect(housing).toBeDefined();
    expect(housing!.amount).toBe("6000.00");

    const dining = result.categoryExpenses.find((c) => c.category === "餐饮");
    expect(dining).toBeDefined();
    expect(dining!.amount).toBe("1200.00");

    const transport = result.categoryExpenses.find((c) => c.category === "交通");
    expect(transport).toBeDefined();
    expect(transport!.amount).toBe("500.00");
  });

  it("无分类的支出归为'未分类'", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [],
      liabilities: [],
      transactions: [
        {
          amount: "1000",
          direction: "expense",
          category: null,
          occurredAt: 1784088000000,
        },
      ],
    };

    const result = calculateDashboard(input);
    const uncategorized = result.categoryExpenses.find(
      (c) => c.category === "未分类",
    );
    expect(uncategorized).toBeDefined();
    expect(uncategorized!.amount).toBe("1000.00");
  });

  it("没有支出时分类为空数组", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [],
      liabilities: [],
      transactions: [],
    };

    const result = calculateDashboard(input);
    expect(result.categoryExpenses).toEqual([]);
  });

  it("资产为 0 时资产负债率为 null", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [],
      liabilities: [{ remainingPrincipal: "50000" }],
      transactions: [],
    };

    const result = calculateDashboard(input);
    expect(result.metrics.totalAssets).toBe("0.00");
    expect(result.metrics.debtRatio).toBeNull();
  });

  it("净资产可以为负数", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [{ type: "bank", currency: "CNY", balance: "30000" }],
      liabilities: [{ remainingPrincipal: "100000" }],
      transactions: [],
    };

    const result = calculateDashboard(input);
    expect(result.metrics.netWorth).toBe("-70000.00");
  });

  it("资产负债率可以超过 100%", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [{ type: "bank", currency: "CNY", balance: "50000" }],
      liabilities: [{ remainingPrincipal: "80000" }],
      transactions: [],
    };

    const result = calculateDashboard(input);
    expect(result.metrics.debtRatio).toBe("160.00");
  });

  it("无财务数据时 hasFinancialData 为 false", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [],
      liabilities: [],
      transactions: [],
    };

    const result = calculateDashboard(input);
    expect(result.hasFinancialData).toBe(false);
  });

  it("无收入时储蓄率为 null", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [],
      liabilities: [],
      transactions: [
        {
          amount: "5000",
          direction: "expense",
          category: "日常",
          occurredAt: 1784088000000,
        },
      ],
    };

    const result = calculateDashboard(input);
    expect(result.metrics.monthlyIncome).toBe("0.00");
    expect(result.metrics.savingsRate).toBeNull();
  });

  it("非 CNY 账户抛出错误", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 3,
      accounts: [{ type: "bank", currency: "USD", balance: "1000" }],
      liabilities: [],
      transactions: [],
    };

    expect(() => calculateDashboard(input)).toThrow(
      "当前仪表盘暂不支持多币种汇总",
    );
  });

  it("月份不合法时抛出错误", () => {
    const input: DashboardInput = {
      baseMonth: "2026-13",
      trendMonths: 3,
      accounts: [],
      liabilities: [],
      transactions: [],
    };

    expect(() => calculateDashboard(input)).toThrow(
      "基准月份格式必须是 YYYY-MM",
    );
  });

  it("趋势范围不合法时抛出错误", () => {
    const input: DashboardInput = {
      baseMonth: "2026-07",
      trendMonths: 4,
      accounts: [],
      liabilities: [],
      transactions: [],
    };

    expect(() => calculateDashboard(input)).toThrow(
      "趋势范围只能是 3、6 或 12 个月",
    );
  });
});