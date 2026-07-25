# 第 21 课：为什么财务计算不能直接用普通 number

## 本课目标

第 20 课建立了计算引擎的基本边界：

```txt
service 和数据库
  负责读取、保存数据

lib/finance
  负责确定性计算
```

我们还编写了第一个月结余函数：

```txt
月结余 = 月收入 - 月支出
```

为了先学习纯函数和测试，第 20 课暂时使用了：

```ts
income: number;
expense: number;
```

这一课要处理这个临时方案留下的问题：

> JavaScript 的 `number` 能不能可靠表示和计算金额？

答案是：

> 普通 `number` 适合许多日常计算，但不能直接作为本项目财务计算的统一金额方案。

本课会：

- 观察 JavaScript 浮点误差。
- 理解误差从哪里来。
- 区分“显示成两位小数”和“计算过程准确”。
- 安装并使用 `decimal.js`。
- 设计项目统一的 Money 工具。
- 实现金额加、减、乘、除。
- 统一金额字符串和金额格式化。
- 改造第 20 课的月结余函数。
- 为常见金额操作编写测试。

学完本课后，你应该能够：

- 解释为什么 `0.1 + 0.2` 不严格等于 `0.3`。
- 说明为什么不能靠 `toFixed(2)` 修复所有金额计算。
- 使用 `Decimal` 完成加减乘除。
- 说明为什么数据库继续使用字符串保存金额。
- 区分金额的存储、计算和展示形式。
- 运行 Money 和月结余测试。

## 一、先确认第 20 课已经完成

第 21 课会直接改造第 20 课的代码。

开始前，项目中应该已经存在：

```txt
ai-finance-cfo/
  lib/
    finance/
      monthly-surplus.ts

  tests/
    finance/
      monthly-surplus.test.ts
```

`package.json` 中应该已经有：

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

并且运行：

```bash
npm run test:run
```

可以看到测试通过。

如果这些内容还没有完成，先完成第 20 课。

本课不会跳过纯函数和测试基础重新讲一遍。

## 二、亲眼观察浮点误差

打开浏览器 Console 或 Node.js。

输入：

```js
0.1 + 0.2
```

结果不是：

```txt
0.3
```

而是类似：

```txt
0.30000000000000004
```

再输入：

```js
0.3 - 0.1
```

会得到类似：

```txt
0.19999999999999998
```

还有：

```js
0.6 * 3
```

可能得到：

```txt
1.7999999999999998
```

这些并不是 JavaScript 随机算错。

它们来自 `number` 的表示方式。

## 三、为什么会出现这种结果

JavaScript 的 `number` 使用二进制浮点数表示数字。

十进制中的一些小数：

```txt
0.1
0.2
0.3
```

无法用有限长度的二进制小数精确表示。

可以类比十进制中的：

```txt
1 ÷ 3 = 0.333333...
```

如果只允许保存有限位数，就只能保存一个近似值：

```txt
0.33
0.3333
0.333333
```

二进制表示 `0.1` 时也会出现类似问题。

程序实际保存的是非常接近 `0.1` 的值，而不是数学意义上绝对精确的 `0.1`。

当多个近似值继续相加、相减、相乘时，误差就可能显示出来。

## 四、为什么财务项目特别在意这个问题

普通页面动画的位置差了极小的一点，用户通常感觉不到。

但金额计算不同。

财务项目需要处理：

- 多条流水汇总。
- 每月储蓄累计。
- 利率计算。
- 复利。
- 分期还款。
- 多个场景之间的金额差异。

一个非常小的误差经过大量计算后可能继续积累。

更重要的是，财务结果应该满足：

```txt
可复算
可测试
可解释
可追溯
```

如果代码返回：

```txt
0.30000000000000004 元
```

即使误差很小，也会直接降低用户对产品的信任。

## 五、toFixed(2) 不是完整解决方案

你可能想到：

```js
(0.1 + 0.2).toFixed(2)
```

结果会显示：

```txt
"0.30"
```

看起来问题消失了。

但 `toFixed(2)` 主要做的是：

```txt
把已有数值四舍五入，并转换成字符串
```

它没有改变前面的计算过程。

例如：

```js
const result = 0.1 + 0.2;
```

`result` 内部仍然是一个浮点近似值。

只有在最后调用：

```js
result.toFixed(2)
```

时，显示结果才变成 `"0.30"`。

因此：

```txt
格式化结果
≠
保证整个计算过程准确
```

`toFixed(2)` 可以参与展示，但不能代替可靠的金额计算模型。

## 六、为什么不使用“先乘 100 再计算”

另一种常见思路是把元换成分：

```js
0.1 元 → 10 分
0.2 元 → 20 分
```

然后使用整数计算：

```js
10 + 20 = 30
```

对于简单的两位小数加减，这种方案可以工作。

但本项目后面还会计算：

- 年利率和月利率。
- 百分比。
- 复利。
- 债务利息。
- 储蓄率。
- 需要保留中间精度的除法。

例如：

```txt
100 元 ÷ 3
```

无法直接得到整数分。

还需要额外定义：

- 什么时候舍入。
- 舍入到几位。
- 余数由谁承担。
- 多次计算是否每一步都舍入。

整数分方案不是错误方案。

但对于本课程后续的复利和场景模拟，使用十进制计算库更容易保持统一。

因此本项目选择：

```txt
decimal.js
```

## 七、decimal.js 负责什么

`decimal.js` 提供一个十进制数类型。

它不会直接使用普通运算符完成金额计算。

普通 `number`：

```ts
0.1 + 0.2
```

`Decimal`：

```ts
new Decimal("0.1").plus("0.2")
```

得到的十进制结果是：

```txt
0.3
```

常用方法包括：

| 运算 | decimal.js 方法 |
| --- | --- |
| 加法 | `plus()` |
| 减法 | `minus()` |
| 乘法 | `times()` |
| 除法 | `dividedBy()` |
| 比较相等 | `equals()` |
| 保留固定小数位 | `toFixed()` |
| 转换为普通字符串 | `toString()` |

注意：

```ts
const amount = new Decimal("10");
```

之后不能写：

```ts
amount + 5
```

要写：

```ts
amount.plus("5")
```

`Decimal` 的运算方法会返回新的 `Decimal`，不会修改原来的值。

这也适合继续保持第 20 课建立的纯函数风格。

## 八、安装 decimal.js

进入项目目录：

```bash
cd ai-finance-cfo
```

运行：

```bash
npm install decimal.js
```

这里不使用 `-D`。

原因是：

- Vitest 只在开发和测试时使用，所以属于开发依赖。
- `decimal.js` 会在应用实际运行时参与财务计算，所以属于正式依赖。

安装后，`package.json` 的 `dependencies` 中应该出现：

```json
"decimal.js": "..."
```

版本号由 npm 自动写入，不需要手动填写。

## 九、先写一个最小 Decimal 例子

可以临时在测试文件中验证：

```ts
import Decimal from "decimal.js";
import { expect, it } from "vitest";

it("Decimal 可以准确计算 0.1 + 0.2", () => {
  const result = new Decimal("0.1").plus("0.2");

  expect(result.toString()).toBe("0.3");
});
```

这里有三个重点。

### 1. 使用字符串创建 Decimal

```ts
new Decimal("0.1")
```

本项目优先使用字符串表示金额：

```txt
"0.1"
"10000"
"6500.25"
```

不要先用普通 `number` 做完计算，再交给 Decimal：

```ts
new Decimal(0.1 + 0.2)
```

这时误差已经在普通 `number` 运算中产生了。

Decimal 只能接收这个已经有误差的结果，不能倒推原本的十进制意图。

### 2. 使用 plus 而不是 +

```ts
new Decimal("0.1").plus("0.2")
```

不要写：

```ts
new Decimal("0.1") + "0.2"
```

JavaScript 运算符可能触发类型转换，结果不再是明确的 Decimal 运算。

### 3. 使用 toString 检查结果

```ts
result.toString()
```

得到：

```txt
"0.3"
```

金额最终进入数据库或 API 时，本来就需要转换成字符串。

## 十、项目中的金额要经过三个阶段

本项目的金额需要区分：

```txt
存储形式
计算形式
展示形式
```

### 1. 存储形式：字符串

数据库 schema 当前使用：

```ts
balance: text("balance").notNull()
```

API 和前端类型中的余额也是：

```ts
balance: string;
```

例如：

```txt
"1234.50"
```

这一设计继续保留。

不要把数据库金额字段改成普通 `number`。

### 2. 计算形式：Decimal

进入计算函数后：

```ts
const amount = new Decimal("1234.50");
```

金额的加减乘除都使用 Decimal 方法。

### 3. 展示形式：格式化字符串

页面最终展示：

```txt
¥1,234.50
```

展示字符串不能再参与计算。

完整流程是：

```txt
数据库金额字符串
  ↓
Decimal
  ↓
计算
  ↓
统一金额字符串
  ↓
格式化展示字符串
```

## 十一、设计 Money 类型

`Decimal` 是第三方库提供的通用十进制类型。

项目还需要表达：

```txt
这个 Decimal 在业务中代表金额
```

新建：

```txt
lib/finance/money.ts
```

先定义：

```ts
import Decimal from "decimal.js";

export type Money = Decimal;
export type MoneyInput = string | Decimal;
```

这里的含义是：

```txt
Money
  计算引擎内部使用的金额对象

MoneyInput
  可以从金额字符串或已有 Money 创建
```

为什么 `MoneyInput` 暂时不包含 `number`？

因为我们希望项目调用者形成明确习惯：

```ts
createMoney("0.1");
```

而不是：

```ts
createMoney(0.1);
```

普通数字字面量不一定马上产生明显错误，但字符串能更清楚地表达十进制金额边界。

利率、月份等非金额值会在对应计算函数中单独设计，不需要全部塞进 Money 类型。

## 十二、创建统一的 createMoney

继续在：

```txt
lib/finance/money.ts
```

增加：

```ts
export function createMoney(value: MoneyInput): Money {
  const money = new Decimal(value);

  if (!money.isFinite()) {
    throw new Error("金额必须是有限数字");
  }

  return money;
}
```

这里检查：

```txt
NaN
Infinity
-Infinity
```

这些值不能成为可信的金额。

注意：

```ts
createMoney("-1500")
```

仍然是合法的。

原因是项目中会出现：

- 负结余。
- 账户负余额。
- 场景差额。

“金额能不能为负数”要由具体业务决定。

Money 工具只拒绝无法计算的值，不替所有业务场景做决定。

## 十三、实现金额加法

在 `money.ts` 中增加：

```ts
export function addMoney(
  left: MoneyInput,
  right: MoneyInput
): Money {
  return createMoney(left).plus(createMoney(right));
}
```

调用：

```ts
const result = addMoney("0.1", "0.2");
```

检查：

```ts
result.toString();
```

得到：

```txt
"0.3"
```

`plus()` 返回新的 Decimal。

传入的 `left` 和 `right` 不会被修改。

## 十四、实现金额减法

增加：

```ts
export function subtractMoney(
  left: MoneyInput,
  right: MoneyInput
): Money {
  return createMoney(left).minus(createMoney(right));
}
```

调用：

```ts
subtractMoney("0.3", "0.1").toString();
```

得到：

```txt
"0.2"
```

第 20 课的月结余函数会使用这个方法：

```txt
收入 - 支出 = 结余
```

## 十五、实现金额乘法

金额乘法常用于：

- 单价乘数量。
- 月储蓄乘月份。
- 本金乘利率。
- 场景参数调整。

增加：

```ts
export function multiplyMoney(
  amount: MoneyInput,
  multiplier: MoneyInput
): Money {
  return createMoney(amount).times(createMoney(multiplier));
}
```

例如：

```ts
multiplyMoney("19.90", "3").toString();
```

得到：

```txt
"59.7"
```

注意结果是：

```txt
"59.7"
```

而不是：

```txt
"59.70"
```

`toString()` 返回表达数值所需的普通字符串，不会自动补齐两位小数。

补齐两位属于输出标准化或展示阶段。

## 十六、实现金额除法

增加：

```ts
export function divideMoney(
  amount: MoneyInput,
  divisor: MoneyInput
): Money {
  const decimalDivisor = createMoney(divisor);

  if (decimalDivisor.isZero()) {
    throw new Error("除数不能为 0");
  }

  return createMoney(amount).dividedBy(decimalDivisor);
}
```

例如：

```ts
divideMoney("100", "4").toString();
```

得到：

```txt
"25"
```

如果：

```ts
divideMoney("100", "0");
```

应该明确抛出：

```txt
除数不能为 0
```

不要让 `Infinity` 继续进入后面的财务计算。

## 十七、为什么运算函数暂时不固定保留两位

可以在每次计算后都写：

```ts
result.toFixed(2)
```

但这样会过早舍入。

例如复利和利息计算可能包含多步：

```txt
本金
  ×
月利率
  ×
月份
```

如果每一步都强制保留两位，小误差可能在多步计算中积累。

因此本项目先规定：

```txt
计算过程中保留 Decimal
到明确的输出边界再统一保留两位
```

这也是为什么：

```ts
addMoney()
subtractMoney()
multiplyMoney()
divideMoney()
```

返回 `Money`，而不是立即返回两位小数字符串。

## 十八、统一金额字符串

数据库和 API 最终需要普通字符串。

在 `money.ts` 中增加：

```ts
export function toMoneyString(value: MoneyInput): string {
  return createMoney(value).toFixed(
    2,
    Decimal.ROUND_HALF_UP
  );
}
```

示例：

```ts
toMoneyString("59.7");
```

得到：

```txt
"59.70"
```

```ts
toMoneyString("10");
```

得到：

```txt
"10.00"
```

```ts
toMoneyString("1.005");
```

得到：

```txt
"1.01"
```

这里使用：

```ts
Decimal.ROUND_HALF_UP
```

表示本课程项目在输出到两位小数时采用“四舍五入”规则。

这是一条明确的项目规则。

真实金融产品可能根据：

- 法律要求。
- 银行规则。
- 会计准则。
- 具体业务合同。

使用不同的舍入方式。

不要把一种舍入策略当成所有财务场景的唯一答案。

## 十九、实现金额格式化

统一金额字符串适合：

- API 返回。
- 数据库存储。
- 测试比较。

页面展示还需要：

- 货币符号。
- 千位分隔符。
- 固定两位小数。

继续在 `money.ts` 中增加：

```ts
export function formatMoney(
  value: MoneyInput,
  symbol = "¥"
): string {
  const fixedValue = toMoneyString(value);
  const isNegative = fixedValue.startsWith("-");
  const unsignedValue = isNegative
    ? fixedValue.slice(1)
    : fixedValue;
  const [integerPart, decimalPart] =
    unsignedValue.split(".");
  const groupedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
  const sign = isNegative ? "-" : "";

  return `${sign}${symbol}${groupedInteger}.${decimalPart}`;
}
```

示例：

```ts
formatMoney("1234.5");
```

得到：

```txt
"¥1,234.50"
```

负数：

```ts
formatMoney("-1500");
```

得到：

```txt
"-¥1,500.00"
```

这个函数没有先转换回普通 `number`。

因此不会为了添加千位分隔符而重新引入普通浮点数。

### 理解格式化中的正则表达式

这里出现：

```ts
/\B(?=(\d{3})+(?!\d))/g
```

现阶段不需要背下来。

它的作用是：

```txt
从右向左，每三位数字前插入逗号
```

例如：

```txt
1234567
  ↓
1,234,567
```

本课重点是理解：

```txt
计算结果
  ↓
标准金额字符串
  ↓
仅用于展示的格式化字符串
```

## 二十、money.ts 的完整结构

完成后：

```txt
lib/finance/money.ts
```

应包含：

```ts
import Decimal from "decimal.js";

export type Money = Decimal;
export type MoneyInput = string | Decimal;

export function createMoney(value: MoneyInput): Money {
  const money = new Decimal(value);

  if (!money.isFinite()) {
    throw new Error("金额必须是有限数字");
  }

  return money;
}

export function addMoney(
  left: MoneyInput,
  right: MoneyInput
): Money {
  return createMoney(left).plus(createMoney(right));
}

export function subtractMoney(
  left: MoneyInput,
  right: MoneyInput
): Money {
  return createMoney(left).minus(createMoney(right));
}

export function multiplyMoney(
  amount: MoneyInput,
  multiplier: MoneyInput
): Money {
  return createMoney(amount).times(createMoney(multiplier));
}

export function divideMoney(
  amount: MoneyInput,
  divisor: MoneyInput
): Money {
  const decimalDivisor = createMoney(divisor);

  if (decimalDivisor.isZero()) {
    throw new Error("除数不能为 0");
  }

  return createMoney(amount).dividedBy(decimalDivisor);
}

export function toMoneyString(value: MoneyInput): string {
  return createMoney(value).toFixed(
    2,
    Decimal.ROUND_HALF_UP
  );
}

export function formatMoney(
  value: MoneyInput,
  symbol = "¥"
): string {
  const fixedValue = toMoneyString(value);
  const isNegative = fixedValue.startsWith("-");
  const unsignedValue = isNegative
    ? fixedValue.slice(1)
    : fixedValue;
  const [integerPart, decimalPart] =
    unsignedValue.split(".");
  const groupedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
  const sign = isNegative ? "-" : "";

  return `${sign}${symbol}${groupedInteger}.${decimalPart}`;
}
```

## 二十一、为 Money 编写测试

新建：

```txt
tests/finance/money.test.ts
```

先导入：

```ts
import { describe, expect, it } from "vitest";
import {
  addMoney,
  createMoney,
  divideMoney,
  formatMoney,
  multiplyMoney,
  subtractMoney,
  toMoneyString
} from "../../lib/finance/money";
```

然后建立测试组：

```ts
describe("Money", () => {
  // 测试写在这里
});
```

## 二十二、测试金额加减乘除

### 1. 测试加法

```ts
it("准确计算小数加法", () => {
  const result = addMoney("0.1", "0.2");

  expect(result.toString()).toBe("0.3");
});
```

这个测试直接覆盖普通 `number` 最经典的误差场景。

### 2. 测试减法

```ts
it("准确计算小数减法", () => {
  const result = subtractMoney("0.3", "0.1");

  expect(result.toString()).toBe("0.2");
});
```

### 3. 测试乘法

```ts
it("准确计算金额乘法", () => {
  const result = multiplyMoney("19.90", "3");

  expect(result.toString()).toBe("59.7");
});
```

### 4. 测试除法

```ts
it("准确计算金额除法", () => {
  const result = divideMoney("100", "4");

  expect(result.toString()).toBe("25");
});
```

### 5. 测试除以 0

```ts
it("除数为 0 时拒绝计算", () => {
  expect(() => divideMoney("100", "0")).toThrow(
    "除数不能为 0"
  );
});
```

这里传给 `expect` 的是一个函数：

```ts
() => divideMoney("100", "0")
```

如果直接写：

```ts
expect(divideMoney("100", "0"))
```

错误会在 `expect` 接管之前发生，Vitest 无法使用 `toThrow()` 检查它。

## 二十三、测试标准化和格式化

继续增加：

```ts
it("把金额统一为两位小数字符串", () => {
  expect(toMoneyString("59.7")).toBe("59.70");
  expect(toMoneyString("10")).toBe("10.00");
});

it("按照 ROUND_HALF_UP 保留两位小数", () => {
  expect(toMoneyString("1.005")).toBe("1.01");
});

it("格式化人民币金额", () => {
  expect(formatMoney("1234.5")).toBe("¥1,234.50");
});

it("格式化负金额", () => {
  expect(formatMoney("-1500")).toBe("-¥1,500.00");
});
```

再测试异常值：

```ts
it("拒绝非有限金额", () => {
  expect(() => createMoney("NaN")).toThrow(
    "金额必须是有限数字"
  );
  expect(() => createMoney("Infinity")).toThrow(
    "金额必须是有限数字"
  );
});
```

## 二十四、不要直接比较 Decimal 对象结构

测试中不要优先写：

```ts
expect(addMoney("0.1", "0.2")).toEqual(
  createMoney("0.3")
);
```

这可能比较 Decimal 对象的内部结构。

业务测试更关心数值是否相等。

可以选择：

### 方法一：比较字符串

```ts
expect(
  addMoney("0.1", "0.2").toString()
).toBe("0.3");
```

### 方法二：使用 equals

```ts
expect(
  addMoney("0.1", "0.2").equals("0.3")
).toBe(true);
```

本课大部分示例使用字符串，是因为：

- 容易看到实际结果。
- 和数据库/API 的字符串边界一致。
- 对初学者更直观。

## 二十五、改造第 20 课的月结余函数

第 20 课的：

```txt
lib/finance/monthly-surplus.ts
```

目前使用：

```ts
income: number;
expense: number;
surplus: number;
```

现在要改成金额字符串边界。

完整代码可以整理为：

```ts
import {
  subtractMoney,
  toMoneyString
} from "./money";

export type MonthlySurplusInput = {
  income: string;
  expense: string;
};

export type MonthlySurplusResult = {
  income: string;
  expense: string;
  surplus: string;
};

export function calculateMonthlySurplus(
  input: MonthlySurplusInput
): MonthlySurplusResult {
  return {
    income: toMoneyString(input.income),
    expense: toMoneyString(input.expense),
    surplus: toMoneyString(
      subtractMoney(input.income, input.expense)
    )
  };
}
```

现在：

```ts
calculateMonthlySurplus({
  income: "10000",
  expense: "6500"
});
```

返回：

```ts
{
  income: "10000.00",
  expense: "6500.00",
  surplus: "3500.00"
}
```

这个结果与项目当前边界一致：

```txt
数据库金额：string
API 金额：string
计算内部：Decimal
计算输出：规范化 string
```

## 二十六、更新月结余测试

打开：

```txt
tests/finance/monthly-surplus.test.ts
```

把输入数字改成字符串。

正常情况：

```ts
it("用月收入减去月支出得到月结余", () => {
  const result = calculateMonthlySurplus({
    income: "10000",
    expense: "6500"
  });

  expect(result).toEqual({
    income: "10000.00",
    expense: "6500.00",
    surplus: "3500.00"
  });
});
```

收支相等：

```ts
it("收入和支出相等时结余为 0", () => {
  const result = calculateMonthlySurplus({
    income: "5000",
    expense: "5000"
  });

  expect(result.surplus).toBe("0.00");
});
```

没有支出：

```ts
it("没有支出时结余等于收入", () => {
  const result = calculateMonthlySurplus({
    income: "8000",
    expense: "0"
  });

  expect(result.surplus).toBe("8000.00");
});
```

发生超支：

```ts
it("支出高于收入时返回负结余", () => {
  const result = calculateMonthlySurplus({
    income: "3000",
    expense: "4500"
  });

  expect(result.surplus).toBe("-1500.00");
});
```

增加一个小数测试：

```ts
it("准确处理带小数的收入和支出", () => {
  const result = calculateMonthlySurplus({
    income: "0.3",
    expense: "0.1"
  });

  expect(result.surplus).toBe("0.20");
});
```

这个测试正是普通 `number` 容易暴露误差的情况。

## 二十七、为什么输出仍然用 string

`calculateMonthlySurplus()` 内部已经使用 Decimal。

为什么不直接返回：

```ts
surplus: Decimal
```

原因是这个结果以后可能要：

- 放进 API JSON。
- 保存到 `calculation_history`。
- 传给前端组件。
- 写入 SQLite。

字符串是更清楚的边界格式：

```txt
"3500.00"
```

如果返回 Decimal 对象，调用方还要知道：

- 什么时候转字符串。
- 保留几位小数。
- 使用什么舍入规则。
- 能不能直接 JSON 序列化。

本项目采用：

> Decimal 留在计算过程内部，跨数据库、API 和页面边界时使用金额字符串。

## 二十八、不要把格式化字符串拿回去计算

下面的值适合展示：

```txt
"¥1,234.50"
```

但不适合计算。

不要写：

```ts
createMoney("¥1,234.50");
```

因为它包含：

- 货币符号。
- 千位分隔符。

计算应使用标准金额字符串：

```txt
"1234.50"
```

所以要区分两个函数：

```txt
toMoneyString()
  生成可存储、可传输、可继续转换的金额字符串

formatMoney()
  生成只用于人类阅读的展示文本
```

页面可以：

```tsx
<p>{formatMoney(account.balance)}</p>
```

但提交 API 时仍然发送：

```txt
"1234.50"
```

本课不要求修改现有 `AccountCard`。

等后续统一仪表盘计算展示时，再把格式化工具接入页面。

## 二十九、金额规则和业务规则要分开

Money 工具负责通用规则：

- 是否为有限数字。
- 如何加减乘除。
- 如何保留两位小数。
- 如何格式化。

具体业务函数负责业务规则。

例如：

```txt
账户余额
  可以为负数吗？

月收入
  可以为负数吗？

债务本金
  必须大于 0 吗？

除数
  可以为 0 吗？
```

这些问题不能全部由 `createMoney()` 决定。

例如：

```ts
createMoney("-1500")
```

应该成功，因为负结余是合法的计算结果。

但创建负债时：

```txt
principal = "-1500"
```

应该由负债 Zod schema 或负债业务规则拒绝。

一句话：

> Money 负责数字可靠，业务函数负责业务合理。

## 三十、金额精度和舍入边界

本课使用：

```ts
toFixed(2, Decimal.ROUND_HALF_UP)
```

把最终金额统一为两位小数。

但要注意：

```txt
计算精度
和
货币最小单位
不是完全相同的问题
```

人民币通常展示到分：

```txt
两位小数
```

但利息计算的中间值可能需要更多小数位。

因此：

```txt
中间计算
  保留 Decimal 精度

明确输出、记账或展示边界
  再保留两位小数
```

不要在每一个 `plus()`、`times()` 后都立即 `toFixed(2)`。

第 23、24 课处理复利和债务利息时，会继续讨论每一步在什么位置舍入。

## 三十一、运行全部测试

完成 Money 和月结余测试后，运行：

```bash
npm run test:run
```

预期至少有两个测试文件：

```txt
tests/finance/money.test.ts
tests/finance/monthly-surplus.test.ts
```

检查：

```txt
Test Files  2 passed
Tests       全部通过
```

然后运行：

```bash
npm run lint
```

如果项目当前没有其他遗留错误，lint 也应该通过。

本课只修改计算工具、月结余函数及其测试。

不要为了通过测试去修改：

- 数据库 schema。
- API Route Handler。
- 仪表盘页面。
- 账户 CRUD。

## 三十二、常见问题

### 1. 提示找不到 decimal.js

确认在：

```txt
ai-finance-cfo/
```

目录运行过：

```bash
npm install decimal.js
```

并检查 `package.json` 的 `dependencies`。

### 2. import Decimal 报错

当前项目启用了：

```json
"esModuleInterop": true
```

使用：

```ts
import Decimal from "decimal.js";
```

不要混用多种导入方式。

### 3. 为什么 toString 没有两位小数

这是正常的。

```ts
createMoney("10.00").toString();
```

会得到：

```txt
"10"
```

`toString()` 表示数值，不负责补零。

需要固定两位时使用：

```ts
toMoneyString("10");
```

得到：

```txt
"10.00"
```

### 4. 为什么不能继续使用加减乘除运算符

`Decimal` 是对象，不是普通 `number`。

必须使用：

```txt
plus
minus
times
dividedBy
```

直接使用运算符可能触发 JavaScript 类型转换，破坏统一的十进制计算方式。

### 5. 月结余测试全部失败

第 21 课把接口从：

```ts
number → number
```

改成了：

```ts
string → string
```

测试中的输入和预期结果也必须一起更新。

尤其注意：

```txt
3500
```

现在应该是：

```txt
"3500.00"
```

### 6. toThrow 测试没有生效

错误调用要包在函数中：

```ts
expect(() => divideMoney("100", "0")).toThrow();
```

不要直接执行：

```ts
expect(divideMoney("100", "0")).toThrow();
```

### 7. 为什么 MoneyInput 不允许 number

这是项目主动设置的边界。

金额优先从数据库和 API 的字符串进入计算层，可以避免调用者先用普通 `number` 运算再传入。

数量、月份、排序位置等整数不是金额，可以继续使用 `number`。

### 8. 为什么不直接把 Decimal 保存进 SQLite

SQLite 当前的金额列是 `text`。

在数据库边界调用：

```ts
toMoneyString(value)
```

得到明确的十进制字符串，更容易查询、调试、迁移和通过 API 传输。

Decimal 是计算过程中的对象，不是数据库字段类型。

## 三十三、本课代码结构

完成后，阶段四相关结构应是：

```txt
ai-finance-cfo/
  lib/
    finance/
      money.ts
      monthly-surplus.ts

  tests/
    finance/
      money.test.ts
      monthly-surplus.test.ts

  package.json
  package-lock.json
```

文件职责：

| 文件 | 职责 |
| --- | --- |
| `money.ts` | Decimal 创建、金额运算、标准化和格式化 |
| `monthly-surplus.ts` | 使用 Money 工具计算月结余 |
| `money.test.ts` | 验证通用金额规则 |
| `monthly-surplus.test.ts` | 验证月结余业务规则 |

依赖方向是：

```txt
monthly-surplus.ts
  ↓
money.ts
  ↓
decimal.js
```

`money.ts` 不应该反过来导入：

```txt
monthly-surplus.ts
```

通用工具不能依赖具体业务计算。

## 三十四、实践任务

按顺序完成：

1. 确认第 20 课的月结余测试能够运行。
2. 在 Console 中观察 `0.1 + 0.2` 的结果。
3. 安装 `decimal.js`。
4. 创建 `lib/finance/money.ts`。
5. 定义 `Money` 和 `MoneyInput`。
6. 实现 `createMoney()`。
7. 实现 `addMoney()`。
8. 实现 `subtractMoney()`。
9. 实现 `multiplyMoney()`。
10. 实现 `divideMoney()`，并拒绝除以 0。
11. 实现 `toMoneyString()`。
12. 使用 `ROUND_HALF_UP` 明确两位小数舍入规则。
13. 实现 `formatMoney()`。
14. 创建 `tests/finance/money.test.ts`。
15. 为加、减、乘、除分别编写测试。
16. 为除以 0 编写测试。
17. 为非有限金额编写测试。
18. 为两位小数字符串编写测试。
19. 为正数和负数格式化编写测试。
20. 把 `monthly-surplus.ts` 从 `number` 改成金额字符串边界。
21. 更新原有月结余测试。
22. 增加 `"0.3" - "0.1"` 的小数月结余测试。
23. 运行 `npm run test:run`。
24. 运行 `npm run lint`。

## 三十五、验收标准

完成后检查：

- `decimal.js` 位于 `dependencies`。
- 存在 `lib/finance/money.ts`。
- 存在 `tests/finance/money.test.ts`。
- Money 输入优先使用字符串。
- `createMoney()` 会拒绝非有限值。
- `"0.1" + "0.2"` 的结果是 `"0.3"`。
- `"0.3" - "0.1"` 的结果是 `"0.2"`。
- `"19.90" × "3"` 的结果是 `"59.7"`。
- `"100" ÷ "4"` 的结果是 `"25"`。
- 除以 `0` 时会抛出明确错误。
- `toMoneyString("59.7")` 返回 `"59.70"`。
- `"1.005"` 按本课规则输出 `"1.01"`。
- `formatMoney("1234.5")` 返回 `"¥1,234.50"`。
- 负金额能正确格式化。
- 月结余函数不再使用普通 `number` 表示金额。
- 月结余的输入和输出与数据库/API 的字符串边界一致。
- 月结余测试包含小数场景。
- Money 运算函数保持纯函数特征。
- `npm run test:run` 中全部测试通过。
- 能解释计算过程为什么不应该过早保留两位小数。
- 能区分标准金额字符串和展示字符串。

## 三十六、复习问题

### 1. 为什么 `0.1 + 0.2` 不严格等于 `0.3`？

因为 JavaScript 的 `number` 使用二进制浮点数表示数字，而 `0.1`、`0.2` 等十进制小数无法用有限二进制位精确表示。程序保存的是近似值，运算后误差可能显示出来。

### 2. 为什么 `toFixed(2)` 不能解决全部问题？

`toFixed(2)` 只对已有结果做舍入和字符串格式化，不会让之前的普通浮点运算重新变准确。它适合输出边界，不是完整的计算模型。

### 3. decimal.js 的作用是什么？

它提供十进制数类型和加减乘除方法，让项目可以按照十进制语义计算金额，并明确控制精度和舍入方式。

### 4. 为什么创建 Decimal 时优先传字符串？

字符串可以直接表达用户和数据库中的十进制金额。若先使用普通 `number` 运算，误差可能已经产生，再创建 Decimal 也无法恢复原始精确值。

### 5. 为什么数据库继续使用 string？

字符串能够稳定保存明确的十进制金额，也方便 API 和 JSON 传输。Decimal 对象只存在于计算过程，跨数据库和 API 边界时转成统一金额字符串。

### 6. 为什么加减乘除函数返回 Money，而不是马上返回两位小数字符串？

因为复杂计算可能包含多个步骤。如果每一步都立即保留两位小数，会过早舍入并积累误差。中间过程保留 Decimal，到明确输出边界再统一舍入。

### 7. `toMoneyString()` 和 `formatMoney()` 有什么区别？

`toMoneyString()` 返回 `"1234.50"`，适合存储、API 和继续转换；`formatMoney()` 返回 `"¥1,234.50"`，只适合页面展示，不能直接拿回计算。

### 8. 为什么 createMoney 允许负数？

负结余、负账户余额和场景差额都可能是合法结果。通用 Money 工具只保证数字可以可靠计算，是否允许负数由具体业务规则决定。

### 9. 为什么除以 0 要主动抛错？

除以 0 无法产生可用的财务结果。如果让 `Infinity` 继续进入后续计算，错误会更难定位，所以应该在最接近问题的位置明确拒绝。

### 10. Money 工具和月结余函数分别负责什么？

Money 工具负责通用的十进制金额运算、标准化和格式化；月结余函数负责“收入减支出”这一具体业务规则。通用层不依赖具体业务层。

## 三十七、本课小结

这一课修复了第 20 课的临时金额方案。

原来的计算是：

```txt
number
  ↓
普通运算符
  ↓
number
```

现在变成：

```txt
数据库/API 金额字符串
  ↓
Decimal
  ↓
plus / minus / times / dividedBy
  ↓
Money
  ↓
toMoneyString
  ↓
标准金额字符串
```

页面展示时再经过：

```txt
标准金额字符串
  ↓
formatMoney
  ↓
¥1,234.50
```

项目现在有了统一金额基础：

- 金额不依赖普通浮点运算。
- 存储、计算和展示边界清楚。
- 舍入规则有明确位置。
- 加减乘除都有自动测试。
- 月结余函数已经接入 Money 工具。

下一课会在这个基础上处理真实流水：

```txt
收入流水
支出流水
  ↓
月度汇总
  ↓
月收入
月支出
月结余
储蓄率
安全现金月数
```

第 22 课不会重新设计金额类型，而是直接复用本课的 `money.ts`。

## 参考资料

- [decimal.js 官方 API 文档](https://mikemcl.github.io/decimal.js/)
- [decimal.js 官方 GitHub 仓库](https://github.com/MikeMcl/decimal.js)
