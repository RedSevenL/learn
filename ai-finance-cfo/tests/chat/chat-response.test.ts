import {
  describe,
  expect,
  it,
} from "vitest";
import {
  chatApiResponseSchema,
} from "../../schemas/chat-response";

describe("chatApiResponseSchema", () => {
  it("接受完整储蓄目标响应", () => {
    const parsed =
      chatApiResponseSchema.safeParse({
        ok: true,
        data: {
          reply: "预计两年后有目标缺口。",
          historyId: "history_001",
          intent: {
            type: "savings_goal",
            targetAmount: "500000",
            deadlineMonths: 24,
          },
          calculation: {
            targetAmount: "500000.00",
            currentAmount: "100000.00",
            monthlySaving: "12000.00",
            annualRate: "3",
            months: 24,
            projectedAmount: "402609.52",
            reached: false,
            gap: "97390.48",
            excess: "0.00",
            requiredMonthlySaving: "15944.79",
            steps: [
              {
                id: "monthly_rate",
                title: "换算月收益率",
                description: "把年化收益率换成月收益率。",
                formula: "annualRate / 100 / 12",
                inputs: {
                  annualRate: "3",
                },
                outputs: {
                  monthlyRate: "0.0025",
                },
              },
            ],
          },
          assumptions: {
            dataMonth: "2026-07",
            currentAmountSource:
              "cash_and_bank_accounts",
            monthlySavingSource:
              "current_month_surplus",
            annualRate: "3",
          },
        },
      });

    expect(parsed.success).toBe(true);
  });

  it("拒绝缺少 calculation 的伪成功响应", () => {
    const parsed =
      chatApiResponseSchema.safeParse({
        ok: true,
        data: {
          reply: "看起来可以。",
          historyId: "history_001",
        },
      });

    expect(parsed.success).toBe(false);
  });

  it("接受稳定错误响应", () => {
    const parsed =
      chatApiResponseSchema.safeParse({
        ok: false,
        error: {
          code: "FINANCIAL_DATA_NOT_READY",
          message: "当前月份没有足够数据",
        },
      });

    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.data.ok).toBe(false);
    }
  });
});