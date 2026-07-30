# 第 25 课：What-if 场景模拟

## 本课目标

前面三课已经建立了三个确定性计算模块：

```txt
第 22 课：现金流计算
第 23 课：储蓄目标计算
第 24 课：债务偿还策略
```

它们分别回答：

```txt
我现在每月能剩多少钱？
按照当前储蓄能力，未来能否达到目标？
按照固定预算，债务多久能还清？
```

这一课开始回答“如果发生变化会怎样”：

> 如果我每个月多花 3000 元，两年后的资金会少多少，50 万元的目标会推迟多久？

这类问题叫：

```txt
What-if 场景模拟
```

它不是预测未来一定会发生什么，而是：

```txt
保持其他假设不变
  ↓
只改变一个或几个参数
  ↓
比较结果差异
```

本课会完成：

```txt
基准场景
  +
收入或支出变化
  ↓
确定性 What-if 计算
  ↓
现金流差异
预计净资产差异
目标达成时间变化
  ↓
保存 scenarios
  ↓
场景模拟页面展示
```

学完后，你应该能够：

- 解释什么是基准场景。
- 区分“输入变化”和“结果差异”。
- 使用有符号金额表示收入或支出的增减。
- 允许场景月结余变成负数。
- 计算固定期限后的预计资金。
- 逐月计算达到目标所需时间。
- 表示“目标在模拟上限内无法达成”。
- 比较基准和变更场景。
- 把场景输入保存到 SQLite。
- 在页面展示“每月多花 3000 元”的影响。
- 说明 What-if 结果依赖哪些假设。

## 一、开始前先完成第 24 课

开始前，计算目录应类似：

```txt
ai-finance-cfo/
  lib/
    finance/
      money.ts
      monthly-surplus.ts
      cash-flow.ts
      savings-goal.ts
      debt-payoff.ts

  tests/
    finance/
      money.test.ts
      monthly-surplus.test.ts
      cash-flow.test.ts
      savings-goal.test.ts
      debt-payoff.test.ts
```

运行：

```bash
npm run test:run
```

全部测试应通过。

当前项目还已经有：

```txt
app/scenarios/page.tsx
```

但页面目前只展示 mock 卡片和：

```txt
待接入计算引擎
```

本课不会删除“场景模拟”路由，而是在原位置把假数据替换成真实输入、计算和保存。

## 二、什么是基准场景

基准场景表示：

> 如果目前的收入、支出和储蓄能力保持不变，未来会怎样？

本课使用以下基准：

```txt
当前目标资金：100000 元
目标金额：500000 元
月收入：20000 元
月支出：8000 元
年化收益率：3%
观察期限：24 个月
```

基准月结余：

```txt
20000 - 8000 = 12000 元
```

按照第 23 课相同的月末投入和收益率口径：

```txt
24 个月后预计资金：402609.52 元
预计第 32 个月达到 50 万元
```

基准场景是比较起点。

没有基准，就无法说明：

```txt
少了多少
多了多少
提前多久
推迟多久
```

## 三、什么是参数变化

What-if 不应该重新发明一整套输入。

它应该明确记录：

```txt
在基准上改变了什么
```

本课先支持：

```txt
monthlyIncomeChange
monthlyExpenseChange
```

例如“每月多花 3000 元”：

```txt
monthlyIncomeChange = "0"
monthlyExpenseChange = "3000"
```

例如“每月少花 1000 元”：

```txt
monthlyExpenseChange = "-1000"
```

例如“每月收入减少 2000 元”：

```txt
monthlyIncomeChange = "-2000"
```

因此变化字段必须允许：

```txt
正数
0
负数
```

## 四、变化值和结果值不能混淆

假设基准月支出是：

```txt
8000
```

变化是：

```txt
+3000
```

场景月支出才是：

```txt
8000 + 3000 = 11000
```

不要把 `monthlyExpenseChange` 直接当成新的月支出。

完整关系：

```txt
场景月收入
= 基准月收入 + 月收入变化

场景月支出
= 基准月支出 + 月支出变化

场景月结余
= 场景月收入 - 场景月支出
```

## 五、本课的“预计净资产”口径

严格的个人净资产是：

```txt
全部资产 - 全部负债
```

不同资产可能有不同收益率，不同负债也可能有不同利率。

本课先使用一个简化模型：

```txt
当前可用于目标的净资产
  +
未来每月结余
  +
统一假设收益
```

如果模拟中的余额降到 `0` 以下，本课仍按同一个月利率计算负余额，相当于用统一的净融资成本继续模拟。

因此本课的 `projectedNetWorth` 更准确地说是：

> 在本场景模型中，用于目标的预计净资产。

它暂时不单独模拟：

- 房产价格。
- 每笔投资的不同收益率。
- 每笔债务的不同利率。
- 税费。
- 新增借款。

页面必须展示假设，不能让用户误以为它是完整资产负债表预测。

如果需要分别处理投资收益率和透支、借款利率，应把第 24 课的债务模型组合进来，而不是继续使用这个统一利率简化口径。

## 六、为什么月结余允许为负数

第 23 课的：

```txt
monthlySaving
```

要求不能为负。

因为“每月储蓄 `-3000` 元”不是正常储蓄输入。

但 What-if 场景不同。

如果：

```txt
月收入 = 10000
月支出 = 12000
```

月结余就是：

```txt
-2000
```

它表示每个月需要消耗已有资金或增加负债。

如果场景计算强行把负结余改成 `0`：

```txt
max(月结余, 0)
```

就会隐藏现金流恶化。

因此本课的未来价值计算必须支持：

```txt
正的每月结余：持续积累
0：没有新增资金
负的每月结余：持续消耗资金
```

## 七、固定期限和目标期限是两个问题

本课同时计算两个时间概念。

### 1. 固定观察期限

例如：

```txt
horizonMonths = 24
```

它回答：

> 24 个月后预计有多少钱？

### 2. 达到目标所需月份

它回答：

> 按照这个场景，需要多少个月达到 50 万元？

基准场景可能：

```txt
24 个月后仍未达到 50 万元
但第 32 个月可以达到
```

因此：

```txt
24 个月内未达成
≠
永远无法达成
```

## 八、目标可能无法达成

如果每月结余为负，而且当前资金低于目标：

```txt
资金可能越来越少
```

即使结余为正，金额太小也可能要非常久。

所以逐月查找目标时间必须有上限。

本课规定：

```txt
最多检查 1200 个月
```

如果仍未达到，返回：

```ts
monthsToGoal: null
```

`null` 表示：

> 按当前模型，在 1200 个月内没有达到目标。

它不等于：

```txt
0 个月
```

## 九、设计 What-if 输入

新建：

```txt
lib/finance/what-if.ts
```

定义：

```ts
export type WhatIfBaseline = {
  currentAmount: string;
  targetAmount: string;
  monthlyIncome: string;
  monthlyExpense: string;
  annualRate: string;
  horizonMonths: number;
};

export type WhatIfChanges = {
  monthlyIncomeChange: string;
  monthlyExpenseChange: string;
};

export type WhatIfInput = {
  baseline: WhatIfBaseline;
  changes: WhatIfChanges;
};
```

字段含义：

| 字段 | 含义 |
| --- | --- |
| `currentAmount` | 当前用于目标的净资产 |
| `targetAmount` | 希望达到的目标金额 |
| `monthlyIncome` | 基准月收入 |
| `monthlyExpense` | 基准月支出 |
| `annualRate` | 名义年化收益率百分比 |
| `horizonMonths` | 固定观察期限 |
| `monthlyIncomeChange` | 场景月收入变化 |
| `monthlyExpenseChange` | 场景月支出变化 |

## 十、设计单个场景结果

```ts
export type WhatIfProjection = {
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySurplus: string;
  projectedNetWorth: string;
  reachesGoalWithinHorizon: boolean;
  monthsToGoal: number | null;
};
```

`monthlySurplus` 和 `projectedNetWorth` 可能是负金额，因此继续使用可表示正负数的金额字符串。

## 十一、设计目标时间影响

```ts
export type GoalTimingImpact =
  | "unchanged"
  | "delayed"
  | "accelerated"
  | "scenario_unreachable"
  | "scenario_reachable"
  | "both_unreachable";
```

含义：

| 值 | 含义 |
| --- | --- |
| `unchanged` | 两个场景达到目标的月份相同 |
| `delayed` | 变更场景更晚达到目标 |
| `accelerated` | 变更场景更早达到目标 |
| `scenario_unreachable` | 基准可达，但变更后 1200 个月内不可达 |
| `scenario_reachable` | 基准不可达，变更后变得可达 |
| `both_unreachable` | 两个场景在上限内都不可达 |

只有两个场景都可达时，才有可直接相减的月份差。

## 十二、设计完整输出

```ts
export type WhatIfResult = {
  targetAmount: string;
  horizonMonths: number;
  baseline: WhatIfProjection;
  scenario: WhatIfProjection;
  differences: {
    monthlySurplus: string;
    projectedNetWorth: string;
    goalMonthDifference: number | null;
    goalTimingImpact: GoalTimingImpact;
  };
};
```

差异统一定义为：

```txt
变更场景 - 基准场景
```

因此：

```txt
monthlySurplus = "-3000.00"
```

表示变更后每月少结余 3000 元。

```txt
projectedNetWorth = "-74108.46"
```

表示固定期限后预计少 74108.46 元。

## 十三、导入 Decimal 和 Money 工具

在 `what-if.ts` 顶部写入：

```ts
import Decimal from "decimal.js";
import {
  createMoney,
  toMoneyString
} from "./money";
```

增加金额取整辅助函数：

```ts
function roundMoney(value: Decimal) {
  return value.toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP
  );
}
```

## 十四、校验输入

增加：

```ts
function assertWhatIfInput(input: WhatIfInput) {
  const currentAmount = createMoney(
    input.baseline.currentAmount
  );
  const targetAmount = createMoney(
    input.baseline.targetAmount
  );
  const monthlyIncome = createMoney(
    input.baseline.monthlyIncome
  );
  const monthlyExpense = createMoney(
    input.baseline.monthlyExpense
  );
  const annualRate = new Decimal(
    input.baseline.annualRate
  );

  if (currentAmount.isNegative()) {
    throw new Error("当前目标资金不能为负数");
  }

  if (targetAmount.lessThanOrEqualTo(0)) {
    throw new Error("目标金额必须大于 0");
  }

  if (monthlyIncome.isNegative()) {
    throw new Error("月收入不能为负数");
  }

  if (monthlyExpense.isNegative()) {
    throw new Error("月支出不能为负数");
  }

  if (!annualRate.isFinite() ||
      annualRate.isNegative()) {
    throw new Error(
      "年化收益率必须是非负有限数字"
    );
  }

  if (
    !Number.isInteger(input.baseline.horizonMonths) ||
    input.baseline.horizonMonths <= 0 ||
    input.baseline.horizonMonths > 1200
  ) {
    throw new Error(
      "观察期限必须是 1 到 1200 的整数月"
    );
  }

  const scenarioIncome = monthlyIncome.plus(
    createMoney(input.changes.monthlyIncomeChange)
  );

  const scenarioExpense = monthlyExpense.plus(
    createMoney(input.changes.monthlyExpenseChange)
  );

  if (scenarioIncome.isNegative()) {
    throw new Error("变更后的月收入不能为负数");
  }

  if (scenarioExpense.isNegative()) {
    throw new Error("变更后的月支出不能为负数");
  }
}
```

变化值本身可以为负，但变化后的收入和支出不能为负。

例如：

```txt
基准支出 8000
支出变化 -9000
```

会得到：

```txt
场景支出 -1000
```

这不是合法财务输入，应该拒绝。

## 十五、计算固定期限后的金额

增加：

```ts
function projectAmount(
  currentAmount: Decimal,
  monthlyCashFlow: Decimal,
  annualRate: Decimal,
  months: number
) {
  const monthlyRate = annualRate
    .dividedBy(100)
    .dividedBy(12);

  if (monthlyRate.isZero()) {
    return currentAmount.plus(
      monthlyCashFlow.times(months)
    );
  }

  const growthFactor = monthlyRate
    .plus(1)
    .pow(months);

  const recurringCashFlowFactor =
    growthFactor
      .minus(1)
      .dividedBy(monthlyRate);

  return currentAmount
    .times(growthFactor)
    .plus(
      monthlyCashFlow.times(
        recurringCashFlowFactor
      )
    );
}
```

它与第 23 课的月末储蓄公式相同，但这里的 `monthlyCashFlow` 允许是负数。

本课暂时把这个更通用的函数放在 `what-if.ts` 内部。

第 27 课统一重构计算测试时，可以再评估是否把共同公式提取到：

```txt
lib/finance/future-value.ts
```

## 十六、逐月查找目标时间

增加：

```ts
const MAX_GOAL_MONTHS = 1200;

function calculateMonthsToGoal(
  currentAmount: Decimal,
  targetAmount: Decimal,
  monthlyCashFlow: Decimal,
  annualRate: Decimal
): number | null {
  if (currentAmount.greaterThanOrEqualTo(
    targetAmount
  )) {
    return 0;
  }

  const monthlyRate = annualRate
    .dividedBy(100)
    .dividedBy(12);

  let balance = currentAmount;

  for (
    let month = 1;
    month <= MAX_GOAL_MONTHS;
    month += 1
  ) {
    balance = balance
      .times(monthlyRate.plus(1))
      .plus(monthlyCashFlow);

    if (balance.greaterThanOrEqualTo(
      targetAmount
    )) {
      return month;
    }
  }

  return null;
}
```

每个月的顺序与第 23 课一致：

```txt
月初资金产生收益
  ↓
月末加入当月结余
```

这里没有每月把预计净资产强制保留两位小数。

原因是它是模型中的高精度中间值，不是实际生成的银行账单利息。

## 十七、判断目标时间影响

增加：

```ts
function compareGoalTiming(
  baselineMonths: number | null,
  scenarioMonths: number | null
): {
  goalMonthDifference: number | null;
  goalTimingImpact: GoalTimingImpact;
} {
  if (
    baselineMonths === null &&
    scenarioMonths === null
  ) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "both_unreachable"
    };
  }

  if (baselineMonths !== null &&
      scenarioMonths === null) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "scenario_unreachable"
    };
  }

  if (baselineMonths === null &&
      scenarioMonths !== null) {
    return {
      goalMonthDifference: null,
      goalTimingImpact: "scenario_reachable"
    };
  }

  const difference =
    scenarioMonths! - baselineMonths!;

  return {
    goalMonthDifference: difference,
    goalTimingImpact:
      difference > 0
        ? "delayed"
        : difference < 0
          ? "accelerated"
          : "unchanged"
  };
}
```

这里的月份差定义为：

```txt
变更场景目标月份 - 基准目标月份
```

正数表示推迟，负数表示提前。

## 十八、建立单个场景结果

增加：

```ts
function createProjection(
  monthlyIncome: Decimal,
  monthlyExpense: Decimal,
  currentAmount: Decimal,
  targetAmount: Decimal,
  annualRate: Decimal,
  horizonMonths: number
): {
  result: WhatIfProjection;
  projectedNetWorth: Decimal;
} {
  const monthlySurplus =
    monthlyIncome.minus(monthlyExpense);

  const projectedNetWorth = roundMoney(
    projectAmount(
      currentAmount,
      monthlySurplus,
      annualRate,
      horizonMonths
    )
  );

  const monthsToGoal = calculateMonthsToGoal(
    currentAmount,
    targetAmount,
    monthlySurplus,
    annualRate
  );

  return {
    projectedNetWorth,
    result: {
      monthlyIncome: toMoneyString(monthlyIncome),
      monthlyExpense:
        toMoneyString(monthlyExpense),
      monthlySurplus:
        toMoneyString(monthlySurplus),
      projectedNetWorth:
        toMoneyString(projectedNetWorth),
      reachesGoalWithinHorizon:
        monthsToGoal !== null &&
        monthsToGoal <= horizonMonths,
      monthsToGoal
    }
  };
}
```

函数同时返回：

- 已格式化的页面结果。
- 仍为 `Decimal` 的预计净资产。

后者用于计算两个场景的金额差。

## 十九、实现完整 What-if 计算

```ts
export function calculateWhatIf(
  input: WhatIfInput
): WhatIfResult {
  assertWhatIfInput(input);

  const currentAmount = createMoney(
    input.baseline.currentAmount
  );
  const targetAmount = createMoney(
    input.baseline.targetAmount
  );
  const monthlyIncome = createMoney(
    input.baseline.monthlyIncome
  );
  const monthlyExpense = createMoney(
    input.baseline.monthlyExpense
  );
  const annualRate = new Decimal(
    input.baseline.annualRate
  );
  const horizonMonths =
    input.baseline.horizonMonths;

  const scenarioIncome = monthlyIncome.plus(
    createMoney(input.changes.monthlyIncomeChange)
  );

  const scenarioExpense = monthlyExpense.plus(
    createMoney(input.changes.monthlyExpenseChange)
  );

  const baseline = createProjection(
    monthlyIncome,
    monthlyExpense,
    currentAmount,
    targetAmount,
    annualRate,
    horizonMonths
  );

  const scenario = createProjection(
    scenarioIncome,
    scenarioExpense,
    currentAmount,
    targetAmount,
    annualRate,
    horizonMonths
  );

  const goalTiming = compareGoalTiming(
    baseline.result.monthsToGoal,
    scenario.result.monthsToGoal
  );

  const monthlySurplusDifference =
    createMoney(scenario.result.monthlySurplus)
      .minus(baseline.result.monthlySurplus);

  const projectedNetWorthDifference =
    scenario.projectedNetWorth.minus(
      baseline.projectedNetWorth
    );

  return {
    targetAmount: toMoneyString(targetAmount),
    horizonMonths,
    baseline: baseline.result,
    scenario: scenario.result,
    differences: {
      monthlySurplus: toMoneyString(
        monthlySurplusDifference
      ),
      projectedNetWorth: toMoneyString(
        projectedNetWorthDifference
      ),
      ...goalTiming
    }
  };
}
```

## 二十、为什么金额差使用已取整结果

本课先把两个期限结果分别保留到分，再相减：

```txt
场景预计净资产 - 基准预计净资产
```

这样页面上可以直接复算：

```txt
328501.06 - 402609.52
= -74108.46
```

如果先比较更高精度的内部值，再单独格式化差异，可能因为两边各自的分位四舍五入而出现一分钱视觉差异。

两种口径都可以成立。

本课选择：

> 页面展示金额之间的差异，也以页面已经展示到分的金额为准。

## 二十一、计算“每月多花 3000 元”

输入：

```ts
const result = calculateWhatIf({
  baseline: {
    currentAmount: "100000",
    targetAmount: "500000",
    monthlyIncome: "20000",
    monthlyExpense: "8000",
    annualRate: "3",
    horizonMonths: 24
  },
  changes: {
    monthlyIncomeChange: "0",
    monthlyExpenseChange: "3000"
  }
});
```

基准结果：

```txt
月结余：12000.00 元
24 个月后预计净资产：402609.52 元
预计第 32 个月达到目标
```

变更结果：

```txt
月支出：11000.00 元
月结余：9000.00 元
24 个月后预计净资产：328501.06 元
预计第 42 个月达到目标
```

差异：

```txt
每月少结余：3000.00 元
24 个月后少：74108.46 元
目标推迟：10 个月
```

为什么不是简单少：

```txt
3000 × 24 = 72000
```

而是：

```txt
74108.46
```

因为每月少留下的资金也失去了后续复利收益。

## 二十二、创建测试文件

新建：

```txt
tests/finance/what-if.test.ts
```

写入：

```ts
import { describe, expect, it } from "vitest";
import {
  calculateWhatIf
} from "../../lib/finance/what-if";

const baseline = {
  currentAmount: "100000",
  targetAmount: "500000",
  monthlyIncome: "20000",
  monthlyExpense: "8000",
  annualRate: "3",
  horizonMonths: 24
};
```

## 二十三、测试每月多花 3000 元

```ts
it("计算增加支出后的净资产和目标延期", () => {
  const result = calculateWhatIf({
    baseline,
    changes: {
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000"
    }
  });

  expect(result.baseline.monthlySurplus).toBe(
    "12000.00"
  );
  expect(result.scenario.monthlySurplus).toBe(
    "9000.00"
  );

  expect(
    result.baseline.projectedNetWorth
  ).toBe("402609.52");

  expect(
    result.scenario.projectedNetWorth
  ).toBe("328501.06");

  expect(
    result.differences.projectedNetWorth
  ).toBe("-74108.46");

  expect(
    result.differences.goalMonthDifference
  ).toBe(10);

  expect(
    result.differences.goalTimingImpact
  ).toBe("delayed");
});
```

## 二十四、测试减少支出会提前目标

```ts
it("减少支出时目标会提前", () => {
  const result = calculateWhatIf({
    baseline,
    changes: {
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "-2000"
    }
  });

  expect(result.scenario.monthlySurplus).toBe(
    "14000.00"
  );

  expect(
    result.differences.monthlySurplus
  ).toBe("2000.00");

  expect(
    result.differences.goalTimingImpact
  ).toBe("accelerated");

  expect(
    result.differences.goalMonthDifference
  ).toBeLessThan(0);
});
```

## 二十五、测试负现金流

```ts
it("场景月结余可以为负数", () => {
  const result = calculateWhatIf({
    baseline: {
      ...baseline,
      monthlyExpense: "19000"
    },
    changes: {
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000"
    }
  });

  expect(result.scenario.monthlySurplus).toBe(
    "-2000.00"
  );

  expect(
    result.differences.goalTimingImpact
  ).toBe("scenario_unreachable");

  expect(result.scenario.monthsToGoal).toBeNull();
});
```

基准月结余：

```txt
20000 - 19000 = 1000
```

在 3% 年化、100000 元起点和 1000 元月结余下，目标可以在 1200 个月内达到。

变更后：

```txt
20000 - 22000 = -2000
```

目标在上限内无法达到。

## 二十六、测试变化后的支出不能为负

```ts
it("拒绝变化后为负的月支出", () => {
  expect(() =>
    calculateWhatIf({
      baseline,
      changes: {
        monthlyIncomeChange: "0",
        monthlyExpenseChange: "-9000"
      }
    })
  ).toThrow("变更后的月支出不能为负数");
});
```

还应继续覆盖：

- 目标金额为 `0`。
- 当前金额为负。
- 基准收入或支出为负。
- 年化收益率为负。
- 观察期限为 `0`。
- 观察期限不是整数。
- 当前金额已经达到目标。
- 基准和变更场景都不可达。
- 变化后从不可达变成可达。
- 收入变化和支出变化同时存在。

## 二十七、运行纯函数测试

进入项目目录：

```bash
cd ai-finance-cfo
```

只运行本课测试：

```bash
npx vitest run tests/finance/what-if.test.ts
```

运行全部测试：

```bash
npm run test:run
```

先确认纯计算稳定，再连接数据库和页面。

## 二十八、现有 scenarios 表能保存什么

当前数据库已经有：

```ts
export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  inputJson: text("input_json").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});
```

本课不需要修改数据库结构。

把基准和变化输入保存到：

```txt
inputJson
```

例如：

```json
{
  "baseline": {
    "currentAmount": "100000",
    "targetAmount": "500000",
    "monthlyIncome": "20000",
    "monthlyExpense": "8000",
    "annualRate": "3",
    "horizonMonths": 24
  },
  "changes": {
    "monthlyIncomeChange": "0",
    "monthlyExpenseChange": "3000"
  }
}
```

数据库保存原始输入，计算结果可以随时由确定性函数重新得到。

第 26 课会把完整公式、步骤和输出保存到：

```txt
calculation_history
```

本课不要提前混合两种职责。

## 二十九、为场景 API 设计 Zod schema

新建：

```txt
schemas/scenario.ts
```

写入：

```ts
import * as z from "zod";
import {
  moneyStringSchema,
  positiveMoneyStringSchema
} from "./finance";

const strictlyPositiveMoneySchema =
  positiveMoneyStringSchema.refine(
    (value) => /[1-9]/.test(value),
    "目标金额必须大于 0"
  );

const annualRateSchema = z
  .string()
  .trim()
  .regex(
    /^\d+(\.\d+)?$/,
    "年化收益率格式不正确"
  );

export const createWhatIfScenarioSchema = z.object({
  name: z.string().trim().min(
    1,
    "场景名称不能为空"
  ),
  description: z.string().trim().optional(),
  baseline: z.object({
    currentAmount: positiveMoneyStringSchema,
    targetAmount: strictlyPositiveMoneySchema,
    monthlyIncome: positiveMoneyStringSchema,
    monthlyExpense: positiveMoneyStringSchema,
    annualRate: annualRateSchema,
    horizonMonths: z
      .number()
      .int()
      .min(1)
      .max(1200)
  }),
  changes: z.object({
    monthlyIncomeChange: moneyStringSchema,
    monthlyExpenseChange: moneyStringSchema
  })
});

export type CreateWhatIfScenarioInput = z.infer<
  typeof createWhatIfScenarioSchema
>;
```

这里复用了：

```txt
positiveMoneyStringSchema
moneyStringSchema
```

基准金额不允许负数，变化金额允许正负。

## 三十、创建场景 service

新建：

```txt
lib/services/scenarios.ts
```

写入：

```ts
import { isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { scenarios } from "@/lib/db/schema";
import type {
  CreateWhatIfScenarioInput
} from "@/schemas/scenario";

export async function listScenarios() {
  return db
    .select()
    .from(scenarios)
    .where(isNull(scenarios.deletedAt));
}

export async function createScenario(
  input: CreateWhatIfScenarioInput
) {
  const now = Date.now();

  const scenario = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    inputJson: JSON.stringify({
      baseline: input.baseline,
      changes: input.changes
    }),
    createdAt: now,
    updatedAt: now
  };

  await db.insert(scenarios).values(scenario);

  return scenario;
}
```

service 只负责：

- 生成 id。
- 序列化输入。
- 写入数据库。
- 读取未删除场景。

它不负责计算。

## 三十一、新增场景 API

新建：

```txt
app/api/scenarios/route.ts
```

写入：

```ts
import {
  errorResponse,
  successResponse
} from "@/lib/api/response";
import {
  calculateWhatIf,
  type WhatIfResult
} from "@/lib/finance/what-if";
import {
  createScenario,
  listScenarios
} from "@/lib/services/scenarios";
import {
  formatZodError
} from "@/schemas/format-zod-error";
import {
  createWhatIfScenarioSchema
} from "@/schemas/scenario";

export async function GET() {
  const scenarios = await listScenarios();

  return successResponse({
    scenarios
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed =
    createWhatIfScenarioSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "场景输入不合法",
      { status: 400 },
      {
        issues: formatZodError(parsed.error)
      }
    );
  }

  let calculation: WhatIfResult;

  try {
    calculation = calculateWhatIf({
      baseline: parsed.data.baseline,
      changes: parsed.data.changes
    });
  } catch (error) {
    return errorResponse(
      "SCENARIO_ERROR",
      error instanceof Error
        ? error.message
        : "场景计算失败",
      { status: 400 }
    );
  }

  try {
    const scenario = await createScenario(
      parsed.data
    );

    return successResponse(
      {
        scenario,
        calculation
      },
      { status: 201 }
    );
  } catch {
    return errorResponse(
      "SCENARIO_SAVE_ERROR",
      "场景保存失败",
      { status: 500 }
    );
  }
}
```

这条 API 完成：

```txt
请求体
  ↓
Zod 校验
  ↓
确定性计算
  ↓
保存原始输入
  ↓
返回场景记录和计算结果
```

本课先计算成功，再保存。

这样非法场景不会进入数据库。

计算输入错误返回 `400`，数据库保存失败返回 `500`。不要把数据库内部错误信息直接暴露给页面。

## 三十二、手动测试场景 API

启动：

```bash
npm run dev
```

在浏览器 Console 中运行：

```js
await fetch("/api/scenarios", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "每月多花 3000 元",
    description: "观察两年资金和目标延期",
    baseline: {
      currentAmount: "100000",
      targetAmount: "500000",
      monthlyIncome: "20000",
      monthlyExpense: "8000",
      annualRate: "3",
      horizonMonths: 24
    },
    changes: {
      monthlyIncomeChange: "0",
      monthlyExpenseChange: "3000"
    }
  })
}).then((response) => response.json());
```

检查返回：

```txt
ok = true
scenario.inputJson 已保存
calculation.differences.monthlySurplus = "-3000.00"
calculation.differences.projectedNetWorth = "-74108.46"
calculation.differences.goalMonthDifference = 10
```

再打开：

```txt
http://localhost:3000/api/scenarios
```

应该能看到刚保存的场景。

## 三十三、定义页面结果文案

不同的 `goalTimingImpact` 需要不同文案。

在 `app/scenarios/page.tsx` 中可以增加：

```ts
function getGoalImpactText(result: WhatIfResult) {
  const impact =
    result.differences.goalTimingImpact;
  const months =
    result.differences.goalMonthDifference;

  if (impact === "delayed") {
    return `目标预计推迟 ${months} 个月`;
  }

  if (impact === "accelerated") {
    return `目标预计提前 ${Math.abs(
      months ?? 0
    )} 个月`;
  }

  if (impact === "scenario_unreachable") {
    return "变更后 1200 个月内无法达到目标";
  }

  if (impact === "scenario_reachable") {
    return "变更后目标从不可达变为可达";
  }

  if (impact === "both_unreachable") {
    return "两个场景在 1200 个月内都不可达";
  }

  return "目标达成时间不变";
}
```

不要把 `null` 直接显示成：

```txt
推迟 null 个月
```

## 三十四、替换场景模拟页面

打开：

```txt
app/scenarios/page.tsx
```

当前文件还是读取：

```ts
scenarioCards
```

这一课直接把该页面替换为客户端表单。

先建立最小状态：

```tsx
"use client";

import { useState } from "react";
import type {
  WhatIfResult
} from "@/lib/finance/what-if";

export default function ScenariosPage() {
  const [name, setName] = useState(
    "每月多花 3000 元"
  );
  const [currentAmount, setCurrentAmount] =
    useState("100000");
  const [targetAmount, setTargetAmount] =
    useState("500000");
  const [monthlyIncome, setMonthlyIncome] =
    useState("20000");
  const [monthlyExpense, setMonthlyExpense] =
    useState("8000");
  const [annualRate, setAnnualRate] =
    useState("3");
  const [horizonMonths, setHorizonMonths] =
    useState("24");
  const [
    monthlyIncomeChange,
    setMonthlyIncomeChange
  ] = useState("0");
  const [
    monthlyExpenseChange,
    setMonthlyExpenseChange
  ] = useState("3000");
  const [result, setResult] =
    useState<WhatIfResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // 提交函数和 JSX 继续写在下面
}
```

## 三十五、提交计算并保存

在组件中增加：

```tsx
async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();
  setError("");
  setIsSubmitting(true);

  try {
    const response = await fetch("/api/scenarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description:
          "比较基准与收入、支出变化后的结果",
        baseline: {
          currentAmount,
          targetAmount,
          monthlyIncome,
          monthlyExpense,
          annualRate,
          horizonMonths: Number(horizonMonths)
        },
        changes: {
          monthlyIncomeChange,
          monthlyExpenseChange
        }
      })
    });

    const body = await response.json();

    if (!body.ok) {
      const firstIssue = body.error.issues?.[0];
      setError(
        firstIssue?.message ?? body.error.message
      );
      return;
    }

    setResult(body.data.calculation);
  } catch {
    setError("场景计算失败，请稍后重试。");
  } finally {
    setIsSubmitting(false);
  }
}
```

点击一次提交会同时：

- 计算场景。
- 保存场景输入。
- 返回比较结果。

因此按钮文案应写成：

```txt
计算并保存场景
```

不要只写“计算”，让用户误以为不会保存。

## 三十六、编写表单 JSX

在组件中返回：

```tsx
return (
  <main className="min-h-screen bg-gray-50 px-6 py-8">
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-gray-500">
          Scenarios
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          What-if 场景模拟
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          保持其他假设不变，比较收入或支出变化
          对未来资金和目标时间的影响。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-700">
            场景名称
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            当前目标资金
            <input
              value={currentAmount}
              onChange={(event) =>
                setCurrentAmount(event.target.value)
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            目标金额
            <input
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(event.target.value)
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            基准月收入
            <input
              value={monthlyIncome}
              onChange={(event) =>
                setMonthlyIncome(event.target.value)
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            基准月支出
            <input
              value={monthlyExpense}
              onChange={(event) =>
                setMonthlyExpense(event.target.value)
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            年化收益率（%）
            <input
              value={annualRate}
              onChange={(event) =>
                setAnnualRate(event.target.value)
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            观察期限（月）
            <input
              value={horizonMonths}
              onChange={(event) =>
                setHorizonMonths(event.target.value)
              }
              inputMode="numeric"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            月收入变化
            <input
              value={monthlyIncomeChange}
              onChange={(event) =>
                setMonthlyIncomeChange(
                  event.target.value
                )
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            月支出变化
            <input
              value={monthlyExpenseChange}
              onChange={(event) =>
                setMonthlyExpenseChange(
                  event.target.value
                )
              }
              inputMode="decimal"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "正在计算..."
            : "计算并保存场景"}
        </button>
      </form>

      {result && (
        <ScenarioComparison result={result} />
      )}
    </div>
  </main>
);
```

## 三十七、展示比较结果

在页面文件中、默认组件之前增加：

```tsx
function ScenarioComparison({
  result
}: {
  result: WhatIfResult;
}) {
  const impactText = getGoalImpactText(result);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">
        场景对比
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h3 className="font-semibold text-gray-900">
            基准场景
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>月结余</dt>
              <dd>{result.baseline.monthlySurplus} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>{result.horizonMonths} 个月后</dt>
              <dd>
                {result.baseline.projectedNetWorth} 元
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>目标月份</dt>
              <dd>
                {result.baseline.monthsToGoal === null
                  ? "1200 个月内不可达"
                  : `第 ${result.baseline.monthsToGoal} 个月`}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h3 className="font-semibold text-gray-900">
            变更场景
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>月结余</dt>
              <dd>{result.scenario.monthlySurplus} 元</dd>
            </div>
            <div className="flex justify-between">
              <dt>{result.horizonMonths} 个月后</dt>
              <dd>
                {result.scenario.projectedNetWorth} 元
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>目标月份</dt>
              <dd>
                {result.scenario.monthsToGoal === null
                  ? "1200 个月内不可达"
                  : `第 ${result.scenario.monthsToGoal} 个月`}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">
          变化影响
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-900">
          <li>
            月结余差异：
            {result.differences.monthlySurplus} 元
          </li>
          <li>
            预计净资产差异：
            {result.differences.projectedNetWorth} 元
          </li>
          <li>{impactText}</li>
        </ul>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        结果基于固定收入、固定支出、名义年化收益率
        和每月末投入假设，不代表未来收益承诺。
      </p>
    </section>
  );
}
```

页面现在不再使用：

```ts
import { scenarioCards } from "@/lib/mock-data";
```

可以删除这条导入。

`lib/mock-data.ts` 中的 `scenarioCards` 暂时可以保留，因为删除 mock 数据不是本课必要任务。

## 三十八、为什么页面不直接调用计算函数

页面虽然可以导入：

```ts
calculateWhatIf()
```

但本课仍然通过：

```txt
POST /api/scenarios
```

原因是一次操作还需要：

- Zod 校验。
- 保存 SQLite。
- 统一错误结构。
- 返回场景 id。

正确链路：

```txt
React 表单
  ↓
POST /api/scenarios
  ↓
Zod
  ↓
calculateWhatIf()
  ↓
scenarios service
  ↓
SQLite
  ↓
页面展示
```

## 三十九、处理重复提交

当前实现每点击一次：

```txt
计算并保存场景
```

都会新增一条记录。

因此已经使用：

```ts
disabled={isSubmitting}
```

防止请求进行中连续点击。

但用户计算完成后再次点击，仍会创建新场景。

这在本课是允许的，因为不同时间保存的场景可以作为不同快照。

未来可以增加：

- 只计算不保存。
- 更新已有场景。
- 场景名称重复提示。
- 删除历史场景。

这些不属于本课 MVP。

## 四十、检查数据库保存结果

提交页面后，调用：

```txt
GET /api/scenarios
```

检查：

- `name` 正确。
- `description` 正确。
- `inputJson` 可以被 `JSON.parse()`。
- `baseline` 没有被变化值覆盖。
- `changes` 保留了正负号。
- `createdAt` 和 `updatedAt` 已保存。
- `deletedAt` 为空。

特别注意：

```txt
数据库保存的是输入快照
```

不要只保存：

```txt
每月多花 3000 元
```

却丢失当时的基准收入、支出、目标和期限。

否则未来无法复算。

## 四十一、真实数据以后如何进入基准场景

本课先让用户手动输入，便于看清每一个变量。

后续可以从项目真实数据提供默认值：

```txt
currentAmount
  ← goals.currentAmount

targetAmount
  ← goals.targetAmount

monthlyIncome
  ← cash-flow.income

monthlyExpense
  ← cash-flow.totalExpense

monthlySurplus
  ← cash-flow.surplus
```

但页面仍应允许用户确认和修改。

原因是：

- 单月现金流可能不代表长期。
- 目标资金可能只包含部分账户。
- 收益率是场景假设，不是数据库事实。

## 四十二、What-if 不是修改真实数据

场景中写：

```txt
月支出变化 +3000
```

不应该修改：

- `transactions`。
- 账户余额。
- 负债余额。
- 现金流历史。

What-if 的作用是：

```txt
保存假设
计算假设结果
```

它不会把假设当成已经发生的真实流水。

## 四十三、为什么不在本课保存计算历史

`scenarios` 保存的是：

```txt
用户设定的场景输入
```

`calculation_history` 保存的是：

```txt
一次计算的公式、步骤、输入和输出
```

这两个概念不同。

本课只完成前者。

第 26 课会增加：

```txt
CalculationStep
formulaJson
outputJson
calculation_history
```

不要在这一课提前把两个表混成一个。

## 四十四、AI 在 What-if 中的位置

用户以后可能直接说：

```txt
如果我每月多花 3000 元会怎样？
```

AI 可以解析为：

```json
{
  "intent": "what_if",
  "changes": {
    "monthlyIncomeChange": "0",
    "monthlyExpenseChange": "3000"
  }
}
```

但基准场景仍应来自：

- 用户确认。
- 当前现金流。
- 当前目标。
- 明确的收益率假设。

AI 不应该自行编造：

- 当前资金。
- 月收入。
- 月支出。
- 目标金额。
- 年化收益率。

正确流程：

```txt
AI 理解变化
  ↓
系统读取并确认基准
  ↓
calculateWhatIf()
  ↓
AI 解释确定性差异
```

## 四十五、常见错误

### 1. 直接修改基准对象

不要写：

```ts
input.baseline.monthlyExpense = ...
```

基准必须保持不变，才能与场景比较。

### 2. 把变化值当成最终值

`monthlyExpenseChange = "3000"` 表示增加 3000，不表示总支出只有 3000。

### 3. 把负结余强制改成 0

这样会隐藏每月资金被消耗的风险。

### 4. 用 `null` 表示 0 个月

当前金额已经达到目标时返回 `0`；上限内不可达时返回 `null`。

### 5. 只比较固定期限金额

用户还关心目标提前或推迟多久，因此需要单独计算 `monthsToGoal`。

### 6. 没有目标月份搜索上限

负现金流场景可能永远无法达到目标，循环必须有安全边界。

### 7. 把场景写入真实流水

What-if 是假设，不是已发生交易。

### 8. 只保存变化，不保存基准

缺少基准就无法在未来复算同一个场景。

### 9. 把场景输入和计算历史混为一谈

场景描述“假设是什么”，计算历史描述“某次如何计算”。

### 10. 把简化净资产当成完整资产负债表

页面必须说明当前模型只包含目标资金、月结余和统一收益率假设。

## 四十六、完整文件结构

完成本课后：

```txt
ai-finance-cfo/
  app/
    api/
      scenarios/
        route.ts
    scenarios/
      page.tsx

  lib/
    finance/
      money.ts
      monthly-surplus.ts
      cash-flow.ts
      savings-goal.ts
      debt-payoff.ts
      what-if.ts
    services/
      scenarios.ts

  schemas/
    finance.ts
    scenario.ts

  tests/
    finance/
      money.test.ts
      monthly-surplus.test.ts
      cash-flow.test.ts
      savings-goal.test.ts
      debt-payoff.test.ts
      what-if.test.ts
```

数据流：

```txt
场景页面
  ↓
POST /api/scenarios
  ↓
Zod schema
  ↓
calculateWhatIf()
  ↓
scenarios service
  ↓
SQLite
  ↓
返回比较结果
  ↓
页面展示
```

## 四十七、实践任务

1. 完成并验收第 24 课。
2. 创建 `lib/finance/what-if.ts`。
3. 定义基准场景类型。
4. 定义参数变化类型。
5. 定义单个场景输出类型。
6. 定义目标时间影响联合类型。
7. 定义完整比较结果。
8. 校验基准金额。
9. 允许变化值为正数、`0` 或负数。
10. 校验变化后的收入和支出不能为负。
11. 计算基准月结余。
12. 计算变更场景月结余。
13. 支持负月结余。
14. 计算固定期限后的基准净资产。
15. 计算固定期限后的场景净资产。
16. 逐月查找基准目标月份。
17. 逐月查找场景目标月份。
18. 设置 1200 个月搜索上限。
19. 计算月结余差异。
20. 计算预计净资产差异。
21. 计算目标提前或延期月份。
22. 处理目标不可达状态。
23. 创建 `tests/finance/what-if.test.ts`。
24. 测试每月多花 3000 元。
25. 测试减少支出。
26. 测试负现金流。
27. 测试非法变化结果。
28. 创建 `schemas/scenario.ts`。
29. 创建 `lib/services/scenarios.ts`。
30. 创建 `app/api/scenarios/route.ts`。
31. 手动测试保存场景。
32. 替换 `app/scenarios/page.tsx` 的 mock 页面。
33. 创建 What-if 输入表单。
34. 提交计算并保存。
35. 展示基准和变更场景。
36. 展示净资产差异。
37. 展示目标提前、延期或不可达。
38. 展示模型假设说明。
39. 运行全部测试。
40. 运行 lint。

## 四十八、验收标准

- 能建立一个不会被修改的基准场景。
- 能输入当前资金、目标、收入、支出、收益率和期限。
- 能分别改变月收入和月支出。
- 变化金额允许正负。
- 变化后的收入和支出不能为负。
- 能计算基准与场景月结余。
- 场景月结余允许为负。
- 能计算固定期限后的预计净资产。
- 能计算净资产差异。
- 能逐月计算目标达成月份。
- 当前已经达标时返回 `0` 个月。
- 1200 个月内不可达时返回 `null`。
- 能表示提前、延期和不可达。
- “每月多花 3000 元”示例结果正确。
- 能把基准和变化一起保存到 `scenarios.inputJson`。
- 非法场景不会写入数据库。
- 页面不再显示“待接入计算引擎”。
- 页面能提交并保存场景。
- 页面能并排展示基准和变更结果。
- 页面能展示月结余、净资产和目标时间差异。
- 页面明确展示固定收益率等模型假设。
- What-if 不会修改真实流水或账户余额。
- `npm run test:run` 全部通过。
- `npm run lint` 没有新增错误。
- 没有提前混入第 26 课的计算历史。

## 四十九、复习问题

### 1. 什么是基准场景？

基准场景表示所有关键参数保持当前假设不变时的未来结果，是 What-if 比较的起点。

### 2. 为什么必须同时保存基准和变化？

只有变化值无法说明它是在什么收入、支出、目标和期限上发生的，也无法在未来复算。

### 3. 为什么变化值允许负数？

负数可以表示收入减少或支出减少。变化后的实际收入和支出仍不能为负。

### 4. 为什么月结余允许为负？

负结余表示每个月在消耗已有资金或增加负债，是 What-if 必须暴露的风险，不能强制改成 0。

### 5. 固定观察期限和目标达成月份有什么区别？

固定期限回答“某个月后有多少钱”，目标月份回答“需要多久达到指定金额”。

### 6. `monthsToGoal` 的 `0` 和 `null` 有什么区别？

`0` 表示当前已经达到目标；`null` 表示在 1200 个月模拟上限内没有达到目标。

### 7. 为什么每月多花 3000 元，两年影响大于 72000 元？

除了少留下 72000 元本金，还失去了这些资金原本可能产生的复利收益。

### 8. 为什么 What-if 不修改 transactions？

场景是假设，不是已经发生的真实交易。修改流水会污染真实财务数据。

### 9. scenarios 和 calculation_history 有什么区别？

`scenarios` 保存假设输入，`calculation_history` 保存某次计算的公式、步骤和输出。

### 10. 为什么结果不是未来承诺？

固定收入、固定支出、固定收益率和持续月末投入都只是模型假设，真实未来可能不同。

## 五十、本课小结

这一课把已有计算模块扩展为场景比较：

```txt
基准收入和支出
  ↓
基准月结余
  ↓
基准未来结果

收入或支出变化
  ↓
场景月结余
  ↓
场景未来结果
```

两个结果相减后得到：

```txt
每月现金流差异
预计净资产差异
目标提前或延期
```

完整闭环是：

```txt
React 场景表单
  ↓
Zod 校验
  ↓
确定性 What-if 计算
  ↓
保存 scenarios
  ↓
页面展示比较结果
```

项目现在能够回答：

> 如果我每月多花 3000 元，在其他假设不变时，两年后的资金和储蓄目标会受到什么影响？

下一课会为计算结果增加可追溯步骤：

```txt
输入
公式
中间值
输出
  ↓
CalculationStep
  ↓
calculation_history
```

届时用户不仅能看到结果，还能看到结果是如何算出来的。
