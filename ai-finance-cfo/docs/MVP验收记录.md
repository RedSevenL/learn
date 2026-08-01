# MVP 验收记录

- 验收日期：2026-07-31
- 验收人：待填写
- 代码版本：基于 commit `ed510cf`，并包含第 32 至 34 课未提交课程练习修改
- 演示数据库：`data/mvp-demo.db`
- 演示月份：`2026-07`（Asia/Shanghai）

## 需求追踪矩阵

| 编号 | 能力 | 验收方式 | 预期结果 | 实际结果 | 证据 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| MVP-01 | 创建账户 | 浏览器 | 账户保存并显示 | 待人工操作 | 待补页面截图 | 待验收 |
| MVP-02 | CSV 预览 | 浏览器 | 合法、错误和疑似重复行可区分 | 待人工操作 | 待补页面截图 | 待验收 |
| MVP-03 | CSV 确认 | 浏览器 + API | 确认后写入 6 条流水 | 待人工操作 | 待补 API 响应 | 待验收 |
| MVP-04 | 仪表盘指标 | 浏览器 | 指标符合固定演示数据 | 待人工操作 | 待补页面截图 | 待验收 |
| MVP-05 | Chat 意图 | 浏览器 + 历史 | 解析为 `savings_goal` | 需要一次显式真实 DeepSeek 请求 | 待补结构化响应 | 阻塞 |
| MVP-06 | 确定性计算 | 浏览器 + 测试 | 结果与计算函数一致 | 自动测试已通过；浏览器待验收 | 217 项测试通过；待补页面截图 | 待验收 |
| MVP-07 | 保存历史 | API + 数据库 | 新增一条 history | 待人工操作 | 待补 `historyId` 与 API 记录 | 待验收 |
| MVP-08 | 前端展示 | 浏览器 | 回复、金额、假设和步骤可见 | 待人工操作 | 待补页面截图 | 待验收 |
| MVP-09 | 历史回读 | 浏览器 | 刷新后仍能看到历史 | 历史页面已经实现，待数据库验证 | `app/history/page.tsx` | 待验收 |
| MVP-10 | 自动检查 | 命令 | test、lint、build 通过 | `npm run check` 完整通过 | 本文“自动检查” | 通过 |
| MVP-11 | README | 文档检查 | 本地运行和功能说明完整 | 已按项目实际能力重写 | `README.md` | 通过 |

状态只使用：

- 待验收
- 通过
- 失败
- 阻塞

没有人工证据的项目不会标记为通过。

## 固定演示数据

### 账户

| 名称 | 类型 | 币种 | 余额 |
| --- | --- | --- | --- |
| E2E 工资卡 | bank | CNY | 100000.00 |
| E2E 现金 | cash | CNY | 10000.00 |
| E2E 投资账户 | investment | CNY | 20000.00 |

### 负债

| 名称 | 初始本金 | 剩余本金 | 年利率 | 最低还款额 |
| --- | --- | --- | --- | --- |
| E2E 消费贷 | 50000.00 | 30000.00 | 5 | 2000.00 |

### 本月现金流

| 项目 | 金额 |
| --- | ---: |
| 收入 | 20000.00 |
| 居住 | 4500.00 |
| 餐饮 | 1500.00 |
| 交通 | 500.00 |
| 购物 | 1000.00 |
| 水电燃气 | 500.00 |

预期：

```txt
月支出 = 8000.00
月结余 = 12000.00
储蓄率 = 60.00%
```

## 仪表盘预期

```txt
总资产 = 130000.00
总负债 = 30000.00
净资产 = 100000.00
资产负债率 = 23.08%
月收入 = 20000.00
月支出 = 8000.00
月结余 = 12000.00
储蓄率 = 60.00%
```

分类支出：

```txt
居住 4500.00
餐饮 1500.00
购物 1000.00
交通 500.00
水电燃气 500.00
```

## Chat 预期

人工问题：

```txt
我两年内能攒够 50 万吗？
```

预期意图：

```json
{
  "type": "savings_goal",
  "targetAmount": "500000",
  "deadlineMonths": 24
}
```

预期计算输入：

```json
{
  "targetAmount": "500000",
  "currentAmount": "110000.00",
  "monthlySaving": "12000.00",
  "annualRate": "3",
  "months": 24
}
```

使用 3% 名义年化收益率时，预期输出：

```txt
projectedAmount = 413227.09
reached = false
gap = 86772.91
excess = 0.00
requiredMonthlySaving = 15512.68
```

如果人工演示使用其他 `CHAT_SAVINGS_ANNUAL_RATE`，必须重新计算并记录，
不能修改预期去迁就页面结果。

## 金额来自确定性代码的证据

1. `parseIntentWithDeepSeek` 只返回受限 `FinanceIntent`。
2. 意图类型不包含 `projectedAmount`、`gap` 或
   `requiredMonthlySaving`。
3. `executeChatService` 读取本地账户和流水后调用
   `calculateSavingsGoal`。
4. 储蓄目标纯函数测试不需要 DeepSeek，并对相同输入产生相同输出。

## 错误路径

| 场景 | 预期 | 实际结果 | 证据 | 状态 |
| --- | --- | --- | --- | --- |
| 缺少 API Key | AI 服务错误，不写历史 | DeepSeek 边界自动测试通过；页面待人工验证 | `tests/ai/deepseek.test.ts` | 待验收 |
| 当前月无流水 | `FINANCIAL_DATA_NOT_READY` | 上下文构造自动测试通过；页面待人工验证 | `tests/chat/build-savings-goal-context.test.ts` | 待验收 |
| 负月结余 | `NEGATIVE_MONTHLY_SURPLUS` | 自动测试通过 | `tests/chat/build-savings-goal-context.test.ts` | 通过 |
| 不支持意图 | `UNSUPPORTED_INTENT` | 自动测试通过 | `tests/chat/chat-service.test.ts` | 通过 |
| 历史保存失败 | `HISTORY_SAVE_FAILED` | 自动测试通过 | `tests/chat/chat-service.test.ts` | 通过 |
| Chat 普通重复提交 | 客户端只提交一次 | 已有提交锁，待浏览器验证 | 页面操作证据 | 待验收 |
| 单条坏历史 | 只隔离该条记录 | 8 项历史解析测试通过 | `tests/history/calculation-history.test.ts` | 通过 |

## 自动检查

| 命令 | 结果 | 日期 | 备注 |
| --- | --- | --- | --- |
| `npm run test:run` | 通过 | 2026-07-31 | 23 个测试文件，217 项测试全部通过 |
| `npm run lint` | 通过 | 2026-07-31 | ESLint 无错误 |
| `npm run build` | 通过 | 2026-07-31 | 22 个页面/路由完成生产构建；存在多 lockfile 根目录提示 |
| 本地生产模式冒烟检查 | 通过 | 2026-07-31 | 首页、6 个功能页、健康 API、历史 API 均返回 HTTP 200 |

## 人工端到端操作记录

以下步骤需要在浏览器中使用隔离数据库完成：

1. 创建 3 个 E2E 账户。
2. 通过负债 API 创建 E2E 消费贷。
3. 预览并确认导入 `mvp-demo.csv`。
4. 再次预览同一 CSV，验证 6 条疑似重复。
5. 核对仪表盘指标与分类支出。
6. 明确同意后提交一次真实 DeepSeek Chat 问题。
7. 记录结构化意图、假设、计算输出、步骤和 `historyId`。
8. 在历史 API 和 `/history` 核对同一 ID。
9. 刷新 `/history`，确认记录仍存在。
10. 恢复原 `DB_FILE_NAME`。

## 最终结论

第 34 课代码实现和自动检查已经完成，独立演示数据库已经初始化。涉及
真实浏览器操作和真实 DeepSeek 的端到端证据尚未完成，不能标记 MVP
全部通过。
