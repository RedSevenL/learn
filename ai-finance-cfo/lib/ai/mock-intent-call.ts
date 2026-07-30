/**
 * 假模型输出，用于在接入真实 DeepSeek API 之前验证：
 *
 * - schema 校验
 * - 解析函数
 * - 错误处理
 * - 测试矩阵
 *
 * 第 29 课会把这个文件替换为真实的 DeepSeek API 调用，
 * 其余契约（schema、解析函数、测试）保持不变。
 */

// ── 四个成功示例 ─────────────────────────────────

const mockModelOutputs: Record<string, string> = {
  "我两年内能攒够 50 万吗？": JSON.stringify({
    type: "savings_goal",
    targetAmount: "500000",
    deadlineMonths: 24,
  }),
  "每月多还 2000 元，用雪崩法多久能还清？": JSON.stringify({
    type: "debt_payoff",
    strategy: "avalanche",
    extraPayment: "2000",
  }),
  "预测未来 6 个月的现金流。": JSON.stringify({
    type: "cashflow_forecast",
    months: 6,
  }),
  "如果每月多花 3000 元，两年后会怎样？": JSON.stringify({
    type: "what_if",
    monthlyIncomeChange: "0",
    monthlyExpenseChange: "3000",
    horizonMonths: 24,
  }),
};

// ── 三个失败示例 ─────────────────────────────────

const mockFailureOutputs: Record<string, string> = {
  "推荐一只股票。": JSON.stringify({
    type: "stock_recommendation",
    symbol: "ABC",
  }),
  "我什么时候能攒够？": JSON.stringify({
    type: "savings_goal",
    targetAmount: "0",
    deadlineMonths: 24,
  }),
  "非法 JSON": '{"type": "cashflow_forecast", "months": 6',
};

/**
 * 模拟模型调用。
 *
 * 这不是自然语言解析器，也不是关键词匹配器。
 * 它只是用固定映射替代网络调用，以便先验证数据流和契约。
 */
export function mockIntentCall(userMessage: string): string {
  const matched = mockModelOutputs[userMessage];

  if (matched !== undefined) {
    return matched;
  }

  // 检查是否在失败示例中
  const failure = mockFailureOutputs[userMessage];

  if (failure !== undefined) {
    return failure;
  }

  // 未知问题 → 返回一个非法的未知意图
  return JSON.stringify({
    type: "unsupported",
  });
}