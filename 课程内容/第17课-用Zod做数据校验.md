# 第 17 课：用 Zod 做数据校验

## 本课目标

项目现在已经有了数据库模型初稿。

但只有数据库表还不够。

用户提交的数据可能是错的：

- 账户名称为空。
- 账户类型不在允许范围内。
- 金额格式错误。
- 流水日期为空。
- 负债利率不是数字。

TypeScript 只能在写代码时提醒开发者。

用户从页面或 API 发来的数据，在运行时仍然需要校验。

这一课使用 Zod 做运行时校验。

你会学到：

- 为什么用户输入必须校验。
- Zod schema 怎么写。
- `parse` 和 `safeParse` 的区别。
- 如何为账户、流水、负债编写 Zod schema。
- API 如何返回校验错误。
- 前端如何展示基础错误提示。
- AI 输出为什么也要校验。

学完本课后，你应该能够：

- 解释 TypeScript 类型和 Zod 运行时校验的区别。
- 编写账户、流水、负债的 Zod schema。
- 在 API 中使用 `safeParse`。
- 让非法请求返回 `400` 错误。
- 把 Zod 错误整理成前端可展示的消息。

## 一、为什么用户输入必须校验

数据库需要干净的数据。

如果没有校验，用户可能提交：

```json
{
  "name": "",
  "type": "hello",
  "balance": "abc"
}
```

这条数据不应该进入数据库。

原因很简单：

- 空账户名称无法展示。
- 错误账户类型无法统计。
- 非法金额无法计算。
- 后续 AI 问答会基于错误数据得出错误结论。

所以数据进入系统前要经过校验：

```txt
前端表单
  ↓
API
  ↓
Zod 校验
  ↓
通过后再进入业务逻辑和数据库
```

## 二、TypeScript 和 Zod 的区别

TypeScript 是开发时工具。

Zod 是运行时工具。

| 工具 | 发生时间 | 作用 |
| --- | --- | --- |
| TypeScript | 写代码、编译时 | 帮开发者发现类型错误 |
| Zod | 程序运行时 | 校验真实传入的数据 |

例如：

```ts
type CreateAccountInput = {
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: string;
};
```

这只能约束你写 TypeScript 代码时的对象。

但 API 收到的是外部请求：

```ts
const body = await request.json();
```

`body` 可以是任何东西。

所以必须用 Zod 校验：

```ts
const result = createAccountSchema.safeParse(body);
```

通过校验后，才能放心使用：

```ts
result.data
```

## 三、安装 Zod

进入项目目录：

```bash
cd ai-finance-cfo
```

安装：

```bash
npm install zod
```

安装后，`package.json` 的 `dependencies` 里会出现 `zod`。

## 四、Zod 基础写法

Zod 的基本用法是：

```ts
import * as z from "zod";

const accountSchema = z.object({
  name: z.string().min(1),
  balance: z.string()
});
```

校验数据可以用：

```ts
accountSchema.parse(data);
```

如果失败，`parse` 会抛出错误。

API 里更常用：

```ts
const result = accountSchema.safeParse(data);
```

`safeParse` 不会抛错。

它返回：

```ts
if (result.success) {
  result.data;
} else {
  result.error;
}
```

这很适合 API：

```txt
校验通过 → 继续处理
校验失败 → 返回 400
```

Zod 还能推导 TypeScript 类型：

```ts
type AccountInput = z.infer<typeof accountSchema>;
```

这样 schema 和类型可以保持一致。

## 五、创建 schema 文件

创建目录：

```txt
schemas/
```

创建文件：

```txt
schemas/finance.ts
```

先写几个公共 schema：

```ts
import * as z from "zod";

export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,2})?$/, "金额格式不正确");

export const positiveMoneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "金额必须是非负数字");

export const accountTypeSchema = z.enum([
  "cash",
  "bank",
  "credit",
  "investment"
]);

export const transactionDirectionSchema = z.enum([
  "income",
  "expense",
  "transfer"
]);

export const transactionSourceSchema = z.enum(["manual", "csv", "api"]);
```

这里的金额校验规则先保持简单。

允许：

```txt
20000
20000.50
-3500
```

不允许：

```txt
abc
20.999
1,000
```

后续如果要支持千分位输入，可以在表单层先清洗格式。

数据库里仍然保存标准金额字符串。

## 六、账户输入 schema

继续在 `schemas/finance.ts` 里写：

```ts
export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "账户名称不能为空"),
  type: accountTypeSchema,
  currency: z.string().trim().length(3).default("CNY"),
  balance: moneyStringSchema
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
```

它校验的是新增账户请求。

示例合法输入：

```json
{
  "name": "工资卡",
  "type": "bank",
  "currency": "CNY",
  "balance": "20000"
}
```

示例非法输入：

```json
{
  "name": "",
  "type": "unknown",
  "balance": "abc"
}
```

注意：

```ts
currency: z.string().trim().length(3).default("CNY")
```

表示如果请求里没有传 `currency`，默认使用 `CNY`。

## 七、流水输入 schema

继续写：

```ts
export const createTransactionSchema = z.object({
  accountId: z.string().trim().min(1, "账户 ID 不能为空"),
  occurredAt: z.number().int().positive("流水时间不能为空"),
  amount: moneyStringSchema,
  direction: transactionDirectionSchema,
  category: z.string().trim().optional(),
  merchant: z.string().trim().optional(),
  note: z.string().trim().optional(),
  source: transactionSourceSchema.default("manual"),
  rawPayload: z.string().optional()
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>;
```

示例合法输入：

```json
{
  "accountId": "account_001",
  "occurredAt": 1780243200000,
  "amount": "-38.00",
  "direction": "expense",
  "category": "餐饮",
  "merchant": "星巴克",
  "source": "manual"
}
```

这里先让 `occurredAt` 使用时间戳数字。

后续如果表单使用日期字符串，可以在前端转换成时间戳，或者用 Zod 的转换能力处理。

## 八、负债输入 schema

继续写：

```ts
export const createLiabilitySchema = z.object({
  name: z.string().trim().min(1, "负债名称不能为空"),
  principal: positiveMoneyStringSchema,
  remainingPrincipal: positiveMoneyStringSchema,
  annualRate: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "年利率格式不正确"),
  minimumPayment: positiveMoneyStringSchema.optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  startDate: z.number().int().positive().optional(),
  endDate: z.number().int().positive().optional()
});

export type CreateLiabilityInput = z.infer<
  typeof createLiabilitySchema
>;
```

示例合法输入：

```json
{
  "name": "信用卡分期",
  "principal": "12000",
  "remainingPrincipal": "9000",
  "annualRate": "0.12",
  "minimumPayment": "500",
  "dueDay": 15
}
```

`annualRate` 先用字符串保存。

例如：

```txt
0.12
```

表示年利率 12%。

## 九、整理 Zod 错误

Zod 原始错误信息比较详细。

API 返回给前端时，可以整理成简单数组：

创建文件：

```txt
schemas/format-zod-error.ts
```

写入：

```ts
import type { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}
```

如果校验失败，返回给前端：

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据不合法",
    "issues": [
      {
        "path": "name",
        "message": "账户名称不能为空"
      }
    ]
  }
}
```

这样前端可以显示：

```txt
账户名称不能为空
```

## 十、在账户 API 中使用 Zod

打开：

```txt
app/api/accounts/route.ts
```

先保留已有 `GET`。

新增一个 `POST` 示例：

```ts
import { createAccountSchema } from "@/schemas/finance";
import { formatZodError } from "@/schemas/format-zod-error";

export async function POST(request: Request) {
  const body = await request.json();
  const result = createAccountSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "请求数据不合法",
          issues: formatZodError(result.error)
        }
      },
      { status: 400 }
    );
  }

  return Response.json(
    {
      ok: true,
      data: {
        account: result.data
      }
    },
    { status: 201 }
  );
}
```

这个 `POST` 现在只做校验。

校验通过后暂时把数据返回。

后续课程会把这里接到数据库写入。

## 十一、测试非法请求

启动项目：

```bash
npm run dev
```

打开浏览器 Console，发送非法请求：

```js
fetch("/api/accounts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "",
    type: "unknown",
    balance: "abc"
  })
})
  .then((response) => response.json())
  .then((result) => console.log(result));
```

应该看到：

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据不合法",
    "issues": [
      {
        "path": "name",
        "message": "账户名称不能为空"
      }
    ]
  }
}
```

再发送合法请求：

```js
fetch("/api/accounts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "工资卡",
    type: "bank",
    balance: "20000"
  })
})
  .then((response) => response.json())
  .then((result) => console.log(result));
```

应该看到：

```json
{
  "ok": true,
  "data": {
    "account": {
      "name": "工资卡",
      "type": "bank",
      "currency": "CNY",
      "balance": "20000"
    }
  }
}
```

注意 `currency` 自动补成了 `CNY`。

## 十二、流水和负债 API 的校验位置

后续可以用同样方式处理：

```txt
POST /api/transactions
  ↓
createTransactionSchema.safeParse(body)
```

```txt
POST /api/liabilities
  ↓
createLiabilitySchema.safeParse(body)
```

校验失败时统一返回：

```txt
400 VALIDATION_ERROR
```

校验通过后才进入数据库写入。

不要让 API 直接信任前端传来的数据。

## 十三、前端如何展示错误

前端拿到错误响应后，可以先取第一条错误：

```ts
const firstIssue = result.error.issues?.[0];
const message = firstIssue?.message ?? result.error.message;
```

然后显示在表单上方：

```tsx
{errorMessage && (
  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
    {errorMessage}
  </p>
)}
```

初学阶段先显示第一条错误就够了。

后续可以做成：

- 每个字段下面显示自己的错误。
- 表单顶部显示总错误。
- 按钮进入提交中状态。
- 请求失败时显示网络错误。

## 十四、AI 输出也要校验

Zod 不只校验用户输入。

后续接入 AI 时，也要校验 AI 输出。

原因是：

> AI 生成的 JSON 也不一定可靠。

例如希望 AI 输出：

```json
{
  "intentType": "goal_projection",
  "targetAmount": "500000",
  "months": 24
}
```

但 AI 可能输出：

```json
{
  "intent": "我想攒钱",
  "amount": "五十万"
}
```

所以后续也会写：

```ts
const aiIntentSchema = z.object({
  intentType: z.enum(["goal_projection", "cashflow_summary"]),
  targetAmount: moneyStringSchema.optional(),
  months: z.number().int().positive().optional()
});
```

只有 AI 输出通过 Zod 校验，才能进入确定性计算函数。

这符合项目原则：

```txt
AI 负责理解语言
Zod 负责校验结构
代码负责确定性计算
```

## 十五、常见错误

### 1. 只写 TypeScript 类型，不写 Zod

不够：

```ts
type CreateAccountInput = {
  name: string;
  balance: string;
};
```

这不能校验 API 请求。

需要：

```ts
createAccountSchema.safeParse(body);
```

### 2. 用 parse 导致 API 直接报错

`parse` 校验失败会抛出异常。

API 里更推荐：

```ts
safeParse
```

这样可以自己返回清晰的 `400` 响应。

### 3. 金额格式太宽松

不要让这些值进入数据库：

```txt
abc
20.999
一百元
```

先统一成标准金额字符串。

### 4. 忘记处理 request.json 失败

如果请求体不是合法 JSON：

```ts
await request.json()
```

也可能失败。

当前阶段先理解 Zod 主流程。

后续可以增加更完整的 JSON 解析错误处理。

## 十六、实践任务

完成下面任务：

1. 安装 `zod`。
2. 创建 `schemas/finance.ts`。
3. 编写 `moneyStringSchema`。
4. 编写 `createAccountSchema`。
5. 编写 `createTransactionSchema`。
6. 编写 `createLiabilitySchema`。
7. 创建 `schemas/format-zod-error.ts`。
8. 在 `POST /api/accounts` 中使用 `createAccountSchema.safeParse`。
9. 用浏览器 Console 测试合法请求和非法请求。
10. 整理前端展示错误消息的思路。

## 十七、验收标准

完成后检查：

- 非法账户请求会返回 `400`。
- 错误响应包含 `ok: false`。
- 错误响应包含 `VALIDATION_ERROR`。
- 错误响应包含字段级 `issues`。
- 合法账户请求会返回 `ok: true`。
- `currency` 可以默认变成 `CNY`。
- 能说明 TypeScript 类型和 Zod 的区别。
- 能说明 AI 输出为什么也要经过 Zod 校验。

## 十八、复习问题

1. 为什么用户输入不能直接写入数据库？
2. TypeScript 类型为什么不能替代 Zod？
3. `parse` 和 `safeParse` 有什么区别？
4. 为什么 API 校验失败应该返回 `400`？
5. 金额字符串应该允许哪些格式？
6. `formatZodError` 的作用是什么？
7. 前端展示错误时为什么可以先显示第一条错误？
8. AI 输出为什么也要校验？

## 十九、本课小结

这一课给项目加上了运行时校验层。

现在数据进入系统前，会经过：

```txt
请求 body
  ↓
Zod schema
  ↓
校验通过的数据
  ↓
后续业务逻辑和数据库
```

账户、流水、负债都有了输入 schema。

API 也知道如何把非法请求转换成统一错误响应。

下一步会把 API、Zod、Drizzle 和 SQLite 连起来，实现真正的 CRUD：新增、查询、更新、删除财务数据。
