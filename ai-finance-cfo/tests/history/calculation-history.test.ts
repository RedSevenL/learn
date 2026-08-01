import { describe, expect, it } from "vitest";
import {
  parseCalculationHistory,
  type CalculationHistoryRow,
} from "@/schemas/calculation-history";

function createValidRow(
  overrides: Partial<CalculationHistoryRow> = {},
): CalculationHistoryRow {
  return {
    id: "history-001",
    intentType: "savings_goal",
    inputJson: JSON.stringify({
      targetAmount: "500000",
      currentAmount: "110000.00",
      monthlySaving: "12000.00",
      annualRate: "3",
      months: 24,
    }),
    formulaJson: JSON.stringify({
      calculator: "savings_goal",
      version: "1.0.0",
      assumptions: {
        annualRateType: "nominal",
        contributionTiming: "month_end",
        moneyRounding: "half_up_2",
        requiredSavingRounding: "ceil_2",
      },
      steps: [
        {
          id: "monthly_rate",
          title: "换算月收益率",
          description: "把年化收益率转换为月收益率。",
          formula: "annualRate / 100 / 12",
          inputs: { annualRate: "3" },
          outputs: { monthlyRate: "0.0025" },
        },
      ],
    }),
    outputJson: JSON.stringify({
      targetAmount: "500000.00",
      currentAmount: "110000.00",
      monthlySaving: "12000.00",
      annualRate: "3",
      months: 24,
      projectedAmount: "413227.09",
      reached: false,
      gap: "86772.91",
      excess: "0.00",
      requiredMonthlySaving: "15512.68",
    }),
    modelTraceJson: JSON.stringify({
      provider: "deepseek",
      model: "test-model",
      parsedIntent: "savings_goal",
    }),
    createdAt: 1_785_427_200_000,
    ...overrides,
  };
}

describe("parseCalculationHistory", () => {
  it("解析合法的 savings_goal 历史", () => {
    const result = parseCalculationHistory(createValidRow());

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.input.currentAmount).toBe("110000.00");
      expect(result.formula.version).toBe("1.0.0");
      expect(result.formula.steps).toHaveLength(1);
      expect(result.output.projectedAmount).toBe("413227.09");
      expect(result.modelTrace?.model).toBe("test-model");
    }
  });

  it("允许直接计算历史没有模型追踪", () => {
    const result = parseCalculationHistory(
      createValidRow({ modelTraceJson: null }),
    );

    expect(result.status).toBe("valid");

    if (result.status === "valid") {
      expect(result.modelTrace).toBeNull();
    }
  });

  it("隔离非法 input JSON", () => {
    const result = parseCalculationHistory(
      createValidRow({ inputJson: "{" }),
    );

    expect(result).toMatchObject({
      status: "invalid",
      message: "历史 JSON 无法解析",
    });
  });

  it("隔离非法 formula JSON", () => {
    const result = parseCalculationHistory(
      createValidRow({ formulaJson: "not-json" }),
    );

    expect(result).toMatchObject({
      status: "invalid",
      message: "历史 JSON 无法解析",
    });
  });

  it("拒绝缺少 steps 的公式结构", () => {
    const result = parseCalculationHistory(
      createValidRow({
        formulaJson: JSON.stringify({
          calculator: "savings_goal",
          version: "1.0.0",
          assumptions: {
            annualRateType: "nominal",
            contributionTiming: "month_end",
            moneyRounding: "half_up_2",
            requiredSavingRounding: "ceil_2",
          },
        }),
      }),
    );

    expect(result).toMatchObject({
      status: "invalid",
      message: "历史结构与当前版本不兼容",
    });
  });

  it("拒绝不支持的意图类型", () => {
    const result = parseCalculationHistory(
      createValidRow({ intentType: "debt_payoff" }),
    );

    expect(result).toMatchObject({
      status: "invalid",
      message: "暂不支持展示 debt_payoff 历史",
    });
  });

  it("隔离旧版本的不兼容输出结构", () => {
    const result = parseCalculationHistory(
      createValidRow({
        outputJson: JSON.stringify({
          projectedAmount: "413227.09",
          reached: false,
        }),
      }),
    );

    expect(result).toMatchObject({
      status: "invalid",
      message: "历史结构与当前版本不兼容",
    });
  });

  it("坏记录不会向调用者抛出异常", () => {
    expect(() =>
      parseCalculationHistory(
        createValidRow({
          modelTraceJson: "{\"provider\":\"unknown\"}",
        }),
      ),
    ).not.toThrow();
  });
});
