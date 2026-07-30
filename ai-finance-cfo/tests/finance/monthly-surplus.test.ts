import { describe, expect, it } from "vitest";
import { calculateMonthlySurplus } from "../../lib/finance/monthly-surplus";

describe("calculateMonthlySurplus", () => {
  it("用月收入减去月支出得到月结余", () => {
    const result = calculateMonthlySurplus({
      income: "10000",
      expense: "6500",
    });

    expect(result).toEqual({
      income: "10000.00",
      expense: "6500.00",
      surplus: "3500.00",
    });
  });

  it("收入和支出相等时结余为 0", () => {
    const result = calculateMonthlySurplus({
      income: "5000",
      expense: "5000",
    });

    expect(result.surplus).toBe("0.00");
  });

  it("没有支出时结余等于收入", () => {
    const result = calculateMonthlySurplus({
      income: "8000",
      expense: "0",
    });

    expect(result.surplus).toBe("8000.00");
  });

  it("支出高于收入时返回负结余", () => {
    const result = calculateMonthlySurplus({
      income: "3000",
      expense: "4500",
    });

    expect(result.surplus).toBe("-1500.00");
  });

  it("准确处理带小数的收入和支出", () => {
    const result = calculateMonthlySurplus({
      income: "0.3",
      expense: "0.1",
    });

    expect(result.surplus).toBe("0.20");
  });
});
